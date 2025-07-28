/**
 * Update Schema Service Implementation with Token Generation
 */

import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { debugLog, logApiCall, logToolExecution } from '../utils/logger';
import generateToken from './authService';
import { UpdateSchemaArgs, McpToolResult } from '../types';

/**
 * Updates an existing database schema
 * @param args - The arguments for updating a schema
 * @returns The result of the operation
 */
async function updateSchema(args: UpdateSchemaArgs): Promise<McpToolResult> {
  logToolExecution('update_schema', 'START', {
    args: { ...args, userkey: '[HIDDEN]' }
  });

  const { ItemId, CollectionName, SchemaName, SchemaType = 1, Fields, ProjectKey, blocksKey, username, userkey } = args;

  // Validate required fields (now including username and userkey instead of bearerToken)
  if (!ItemId || !CollectionName || !SchemaName || !Fields || !Array.isArray(Fields) || !ProjectKey || !blocksKey || !username || !userkey) {
    const missingFields: string[] = [];
    if (!ItemId) missingFields.push('ItemId');
    if (!CollectionName) missingFields.push('CollectionName');
    if (!SchemaName) missingFields.push('SchemaName');
    if (!Fields || !Array.isArray(Fields)) missingFields.push('Fields');
    if (!ProjectKey) missingFields.push('ProjectKey');
    if (!blocksKey) missingFields.push('blocksKey');
    if (!username) missingFields.push('username');
    if (!userkey) missingFields.push('userkey');

    debugLog('error', 'Missing required fields for updateSchema', { missingFields });
    logToolExecution('update_schema', 'ERROR', { reason: 'Missing required fields', missingFields });

    throw new McpError(
      ErrorCode.InvalidParams,
      `Missing required parameters: ${missingFields.join(', ')}`
    );
  }

  // Validate Fields array
  for (const field of Fields) {
    if (!field.Name || !field.Type) {
      debugLog('error', 'Invalid field structure in updateSchema', { field });
      logToolExecution('update_schema', 'ERROR', { reason: 'Invalid field structure', field });

      throw new McpError(
        ErrorCode.InvalidParams,
        'Each field must have Name and Type properties'
      );
    }
  }

  try {
    // Generate token first
    debugLog('info', '🔐 Generating authentication token for updateSchema');
    const bearerToken = await generateToken(username, userkey, blocksKey);
    debugLog('success', '✅ Token generated successfully for updateSchema');

    const payload = {
      ItemId,
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
      method: 'PUT',
      headers: { ...headers, Authorization: 'Bearer [HIDDEN]' },
      payload
    });

    debugLog('info', '🌐 Making schema update API request', {
      url: requestUrl,
      method: 'PUT',
      payload
    });

    const response = await fetch(requestUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    });

    debugLog('info', '📥 Schema update API response received', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    const responseText = await response.text();
    debugLog('info', '📄 Schema update API response body received');

    let responseData: any;
    try {
      responseData = JSON.parse(responseText);
      debugLog('info', '✅ Successfully parsed JSON response from schema update API');
    } catch (parseError) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error';
      debugLog('warn', '⚠️ Could not parse schema update response as JSON', {
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
      debugLog('error', '❌ Schema update API request failed', {
        status: response.status,
        responseText
      });
      logToolExecution('update_schema', 'ERROR', {
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
          text: `✅ Schema "${SchemaName}" updated successfully!\n\nResponse: ${JSON.stringify(responseData, null, 2)}`,
        },
      ],
    };

    debugLog('success', `🎉 Schema "${SchemaName}" updated successfully`);
    logToolExecution('update_schema', 'SUCCESS', {
      schemaName: SchemaName,
      collectionName: CollectionName,
      fieldsCount: Fields.length,
      itemId: ItemId
    });

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    debugLog('error', '💥 updateSchema operation failed', {
      error: errorMessage,
      stack: errorStack
    });
    logToolExecution('update_schema', 'ERROR', {
      error: errorMessage,
      schemaName: SchemaName,
      collectionName: CollectionName,
      itemId: ItemId
    });

    throw new McpError(
      ErrorCode.InternalError,
      `Failed to update schema: ${errorMessage}`
    );
  }
}

export default updateSchema;
