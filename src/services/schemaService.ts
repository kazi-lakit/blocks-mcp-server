/**
 * Schema Service Implementation - Unified operations for create and update
 */

import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { debugLog, logApiCall, logToolExecution } from '../utils/logger';
import generateToken from './authService';
import { CreateSchemaArgs, UpdateSchemaArgs, McpToolResult, Field } from '../types';


const baseUrl = `${process.env.API_BASE_URL}/graphql/v1`;


/**
 * Create a new schema
 * @param args - Create schema arguments
 * @returns The result of the operation
 */
async function createOperation(args: CreateSchemaArgs): Promise<McpToolResult> {
  const method = 'POST';

  validateFields(args.Fields);

  const url = `${baseUrl}/schemas/define`;
  const bearerToken = await generateToken();
  const responseData = await sendRequest(
    url,
    method,
    bearerToken,
    args
  );
  const result: McpToolResult = {
      content: [
        {
          type: 'text',
          text: `✅ Schema "${args.SchemaName}" created successfully!\n\nResponse: ${JSON.stringify(responseData, null, 2)}`,
        },
      ],
  };
  return result;
}



async function updateOperation(args: UpdateSchemaArgs): Promise<McpToolResult> {
  const method = 'PUT';
  validateFields(args.Fields);
  
  const url = `${baseUrl}/schemas/define`;
  const bearerToken = await generateToken();
  const responseData = await sendRequest(
    url,
    method,
    bearerToken,
    args
  );
  const result: McpToolResult = {
      content: [
        {
          type: 'text',
          text: `✅ Schema "${args.SchemaName}" updated successfully!\n\nResponse: ${JSON.stringify(responseData, null, 2)}`,
        },
      ],
  };
  return result;
}

function getMissingFields(args: Record<string, unknown>): string[] {
  const missingFields: string[] = [];
  if (!args.CollectionName) missingFields.push('CollectionName');
  if (!args.SchemaName) missingFields.push('SchemaName');
  if (!args.Fields || !Array.isArray(args.Fields)) missingFields.push('Fields');
  if (!args.ProjectKey) missingFields.push('ProjectKey');
  return missingFields;
}
function validateFields(fields: any[]): void {
  for (const field of fields) {
    if (!field.Name || !field.Type) {
      debugLog('error', 'Invalid field structure', { field });
      throw new McpError(ErrorCode.InvalidParams, 'Each field must have Name and Type properties');
    }
  }
}

/** * Send a request to the Blocks API
 * @param url - API endpoint
 * @param method - HTTP method (GET, POST, PUT, etc.)
 * @param bearerToken - Bearer token for authentication
 * @param payload - Request payload
 * @returns Parsed JSON response from the API
 */
async function sendRequest(url: string, method: string, bearerToken: string, payload: any): Promise<any>  { 
  const blocksKey = process.env.BLOCKS_KEY || '';
  const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-blocks-key': blocksKey,
      'Authorization': `Bearer ${bearerToken}`,
  };
  debugLog('info', 'Making API request', { url, method, headers: { ...headers, Authorization: 'Bearer [HIDDEN]' }, payload });
  const response = await fetch(url, { method, headers, body: JSON.stringify(payload) });
  debugLog('info', `📥 API response received`, {
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
    response: { response }
  });

  const responseText = await response.text();

    let responseData: any;
    try {
      responseData = JSON.parse(responseText);
      debugLog('info', `✅ Successfully parsed JSON response from API`, { responseText });
    } catch (parseError) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error';
      debugLog('warn', `⚠️ Could not parse API response as JSON`, { 
        parseError: errorMessage, 
        responseText 
      });
      responseData = responseText;
    }
  return responseData;
  
}

/**
 * Creates a new schema
 * @param args - Create schema arguments
 * @returns The result of the operation
 */
async function createSchema(args: Record<string, unknown>): Promise<McpToolResult> {
const missingFields = getMissingFields(args);
  if (missingFields.length > 0) {
    debugLog('error', `Missing required fields for create_operation`, { missingFields });
    throw new McpError(ErrorCode.InvalidParams, `Missing required parameters: ${missingFields.join(', ')}`);
  }
  const createSchemaArgs: CreateSchemaArgs = {
    CollectionName: args.CollectionName as string,
    SchemaName: args.SchemaName as string,
    Fields: args.Fields as Array<Field>,
    ProjectKey: args.ProjectKey as string,
    SchemaType: args.SchemaType as number || 1
  };
  return createOperation(createSchemaArgs);
}

/**
 * Updates an existing schema
 * @param args - Update schema arguments
 * @returns The result of the operation
 */
async function updateSchema(args: Record<string, unknown>): Promise<McpToolResult> {
  const missingFields = getMissingFields(args);
  if (!args.ItemId) missingFields.push('ItemId');
  if (missingFields.length > 0) {
    debugLog('error', `Missing required fields for update_operation`, { missingFields });
    throw new McpError(ErrorCode.InvalidParams, `Missing required parameters: ${missingFields.join(', ')}`);
  }
  const updateSchemaArgs: UpdateSchemaArgs = {
    CollectionName: args.CollectionName as string,
    SchemaName: args.SchemaName as string,
    Fields: args.Fields as Array<Field>,
    ProjectKey: args.ProjectKey as string,
    SchemaType: args.SchemaType as number || 1,
    ItemId: args.ItemId as string
  };
  return updateOperation(updateSchemaArgs);
}

export { createSchema, updateSchema };
