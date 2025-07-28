/**
 * Schema Service Implementation - Unified operations for create and update
 */

import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { debugLog, logApiCall, logToolExecution } from '../utils/logger';
import generateToken from './authService';
import { CreateSchemaArgs, UpdateSchemaArgs, McpToolResult } from '../types';

/**
 * Unified schema operation handler for create and update
 * @param args - The arguments for the schema operation
 * @param operation - The operation type ('create' or 'update')
 * @returns The result of the operation
 */
async function schemaOperation(
  args: CreateSchemaArgs | UpdateSchemaArgs, 
  operation: 'create' | 'update' = 'create'
): Promise<McpToolResult> {
  const isCreate = operation === 'create';
  const logPrefix = isCreate ? 'create_schema' : 'update_schema';
  const method = isCreate ? 'POST' : 'PUT';
  const url = 'https://dev-api.seliseblocks.com/graphql/v1/schemas/define';

  // Log start
  if (isCreate) {
    logToolExecution(logPrefix, 'START', { args: { ...args, userkey: '[HIDDEN]' } });
  } else {
    debugLog('info', 'Starting updateSchema', { args: { ...args, userkey: '[HIDDEN]' } });
  }

  // Extract and validate fields
  const { CollectionName, SchemaName, SchemaType = 1, Fields, ProjectKey, blocksKey, username, userkey } = args;
  const ItemId = 'ItemId' in args ? args.ItemId : undefined;

  // Check required fields
  const missingFields: string[] = [];
  if (!CollectionName) missingFields.push('CollectionName');
  if (!SchemaName) missingFields.push('SchemaName');
  if (!Fields || !Array.isArray(Fields)) missingFields.push('Fields');
  if (!ProjectKey) missingFields.push('ProjectKey');
  if (!blocksKey) missingFields.push('blocksKey');
  if (!username) missingFields.push('username');
  if (!userkey) missingFields.push('userkey');
  if (!isCreate && !ItemId) missingFields.push('ItemId');

  if (missingFields.length > 0) {
    debugLog('error', `Missing required fields for ${logPrefix}`, { missingFields });
    if (isCreate) logToolExecution(logPrefix, 'ERROR', { reason: 'Missing required fields', missingFields });
    throw new McpError(ErrorCode.InvalidParams, `Missing required parameters: ${missingFields.join(', ')}`);
  }

  // Validate Fields array
  for (const field of Fields) {
    if (!field.Name || !field.Type) {
      debugLog('error', `Invalid field structure in ${logPrefix}`, { field });
      if (isCreate) logToolExecution(logPrefix, 'ERROR', { reason: 'Invalid field structure', field });
      throw new McpError(ErrorCode.InvalidParams, 'Each field must have Name and Type properties');
    }
  }

  try {
    debugLog('info', `🔐 Generating authentication token for ${logPrefix}`);
    const bearerToken = await generateToken(username, userkey, blocksKey);
    debugLog('success', `✅ Token generated successfully for ${logPrefix}`);

    const payload = isCreate
      ? { CollectionName, SchemaName, SchemaType, Fields, ProjectKey }
      : { ItemId, CollectionName, SchemaName, SchemaType, Fields, ProjectKey };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-blocks-key': blocksKey,
      'Authorization': `Bearer ${bearerToken}`,
    };

    // Log API request
    if (isCreate) {
      logApiCall('REQUEST', url, { method, headers: { ...headers, Authorization: 'Bearer [HIDDEN]' }, payload });
    } else {
      debugLog('info', 'Making API request', { url, method, headers: { ...headers, Authorization: 'Bearer [HIDDEN]' }, payload });
    }

    debugLog('info', `🌐 Making ${isCreate ? 'schema creation' : 'schema update'} API request`, {
      url,
      method,
      payload
    });

    const response = await fetch(url, { method, headers, body: JSON.stringify(payload) });
    
    debugLog('info', `📥 ${isCreate ? 'Schema creation' : 'Schema update'} API response received`, {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    const responseText = await response.text();
    debugLog('info', `📄 ${isCreate ? 'Schema creation' : 'Schema update'} API response body received`);

    let responseData: any;
    try {
      responseData = JSON.parse(responseText);
      debugLog('info', `✅ Successfully parsed JSON response from ${logPrefix} API`);
    } catch (parseError) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error';
      debugLog('warn', `⚠️ Could not parse ${logPrefix} response as JSON`, { 
        parseError: errorMessage, 
        responseText 
      });
      responseData = responseText;
    }

    // Log API response
    if (isCreate) {
      logApiCall('RESPONSE', url, { 
        status: response.status, 
        statusText: response.statusText, 
        data: responseData 
      });
    }

    if (!response.ok) {
      debugLog('error', `❌ ${isCreate ? 'Schema creation' : 'Schema update'} API request failed`, { 
        status: response.status, 
        responseText 
      });
      if (isCreate) {
        logToolExecution(logPrefix, 'ERROR', { 
          reason: 'API request failed', 
          status: response.status, 
          response: responseText 
        });
      }
      throw new Error(`HTTP ${response.status}: ${responseText}`);
    }

    const result: McpToolResult = {
      content: [
        {
          type: 'text',
          text: `✅ Schema "${SchemaName}" ${isCreate ? 'created' : 'updated'} successfully!\n\nResponse: ${JSON.stringify(responseData, null, 2)}`,
        },
      ],
    };

    debugLog('success', `🎉 Schema "${SchemaName}" ${isCreate ? 'created' : 'updated'} successfully`);
    
    if (isCreate) {
      logToolExecution(logPrefix, 'SUCCESS', { 
        schemaName: SchemaName, 
        collectionName: CollectionName, 
        fieldsCount: Fields.length 
      });
    } else {
      logToolExecution('update_schema', 'SUCCESS', {
        schemaName: SchemaName,
        collectionName: CollectionName,
        fieldsCount: Fields.length,
        itemId: ItemId
      });
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    debugLog('error', `💥 ${isCreate ? 'createSchema' : 'updateSchema'} operation failed`, { 
      error: errorMessage, 
      stack: errorStack 
    });
    
    if (isCreate) {
      logToolExecution(logPrefix, 'ERROR', { 
        error: errorMessage, 
        schemaName: SchemaName, 
        collectionName: CollectionName 
      });
    }

    throw new McpError(
      ErrorCode.InternalError, 
      `Failed to ${isCreate ? 'create' : 'update'} schema: ${errorMessage}`
    );
  }
}

/**
 * Creates a new schema
 * @param args - Create schema arguments
 * @returns The result of the operation
 */
async function createSchema(args: CreateSchemaArgs): Promise<McpToolResult> {
  return schemaOperation(args, 'create');
}

/**
 * Updates an existing schema
 * @param args - Update schema arguments
 * @returns The result of the operation
 */
async function updateSchema(args: UpdateSchemaArgs): Promise<McpToolResult> {
  return schemaOperation(args, 'update');
}

export { createSchema, updateSchema };
