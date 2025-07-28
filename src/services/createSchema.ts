/**
 * Create Schema Service Implementation with Enhanced Logging
 */

import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { debugLog, logApiCall, logToolExecution } from '../utils/logger';
import generateToken from './authService';
import { CreateSchemaArgs, McpToolResult, Field } from '../types';

/**
 * Creates a new database schema with field definitions
 * @param args - The arguments for creating a schema
 * @returns The result of the operation
 */
async function createSchema(args: CreateSchemaArgs): Promise<McpToolResult> {
  logToolExecution('create_schema', 'START', {
    args: { ...args, userkey: '[HIDDEN]' }
  });

  const { CollectionName, SchemaName, SchemaType = 1, Fields, ProjectKey, blocksKey, username, userkey } = args;

  // Validate required fields
  if (!CollectionName || !SchemaName || !Fields || !Array.isArray(Fields) || !ProjectKey || !blocksKey || !username || !userkey) {
    const missingFields: string[] = [];
    if (!CollectionName) missingFields.push('CollectionName');
    if (!SchemaName) missingFields.push('SchemaName');
    if (!Fields || !Array.isArray(Fields)) missingFields.push('Fields');
    if (!ProjectKey) missingFields.push('ProjectKey');
    if (!blocksKey) missingFields.push('blocksKey');
    if (!username) missingFields.push('username');
    if (!userkey) missingFields.push('userkey');

    debugLog('error', 'Missing required fields for createSchema', { missingFields });
    logToolExecution('create_schema', 'ERROR', { reason: 'Missing required fields', missingFields });

    throw new McpError(
      ErrorCode.InvalidParams,
      `Missing required parameters: ${missingFields.join(', ')}`
    );
  }

  // Validate Fields array
  for (const field of Fields) {
    if (!field.Name || !field.Type) {
      debugLog('error', 'Invalid field structure in createSchema', { field });
      logToolExecution('create_schema', 'ERROR', { reason: 'Invalid field structure', field });

      throw new McpError(
        ErrorCode.InvalidParams,
        'Each field must have Name and Type properties'
      );
    }
  }

  try {
    // Generate token first
    debugLog('info', '🔐 Generating authentication token for createSchema');
    const bearerToken = await generateToken(username, userkey, blocksKey);
    debugLog('success', '✅ Token generated successfully for createSchema');

    const payload = {
      CollectionName,
      SchemaName,
      SchemaType,
      Fields,
      ProjectKey
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-blocks-key': blocksKey,
      'Authorization': `Bearer ${bearerToken}`,
    };

    const requestUrl = 'https://dev-api.seliseblocks.com/graphql/v1/schemas/define';

    // Log API request
    logApiCall('REQUEST', requestUrl, {
      method: 'POST',
      headers: { ...headers, Authorization: 'Bearer [HIDDEN]' },
      payload
    });

    debugLog('info', '🌐 Making schema creation API request', {
      url: requestUrl,
      method: 'POST',
      payload
    });

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    debugLog('info', '📥 Schema creation API response received', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    const responseText = await response.text();
    debugLog('info', '📄 Schema creation API response body received');

    let responseData: any;
    try {
      responseData = JSON.parse(responseText);
      debugLog('info', '✅ Successfully parsed JSON response from schema creation API');
    } catch (parseError) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error';
      debugLog('warn', '⚠️ Could not parse schema creation response as JSON', {
        parseError: errorMessage,
        responseText
      });
      responseData = responseText;
    }

    // Log API response
    logApiCall('RESPONSE', requestUrl, {
      status: response.status,
      statusText: response.statusText,
      data: responseData
    });

    if (!response.ok) {
      debugLog('error', '❌ Schema creation API request failed', {
        status: response.status,
        responseText
      });
      logToolExecution('create_schema', 'ERROR', {
        reason: 'API request failed',
        status: response.status,
        response: responseText
      });

      throw new Error(`HTTP ${response.status}: ${responseText}`);
    }

    const result: McpToolResult = {
      content: [
        {
          type: 'text',
          text: `✅ Schema "${SchemaName}" created successfully!\n\nResponse: ${JSON.stringify(responseData, null, 2)}`,
        },
      ],
    };

    debugLog('success', `🎉 Schema "${SchemaName}" created successfully`);
    logToolExecution('create_schema', 'SUCCESS', {
      schemaName: SchemaName,
      collectionName: CollectionName,
      fieldsCount: Fields.length
    });

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    debugLog('error', '💥 createSchema operation failed', {
      error: errorMessage,
      stack: errorStack
    });
    logToolExecution('create_schema', 'ERROR', {
      error: errorMessage,
      schemaName: SchemaName,
      collectionName: CollectionName
    });

    throw new McpError(
      ErrorCode.InternalError,
      `Failed to create schema: ${errorMessage}`
    );
  }
}

export default createSchema;
