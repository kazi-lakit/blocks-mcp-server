/**
 * Type definitions for the MCP Blocks project
 */

export interface Field {
  Name: string;
  Type: string;
}

export interface CreateSchemaArgs {
  CollectionName: string;
  SchemaName: string;
  SchemaType?: number;
  Fields: Field[];
  ProjectKey: string;
  blocksKey: string;
  username: string;
  userkey: string;
}

export interface UpdateSchemaArgs extends CreateSchemaArgs {
  ItemId: string;
}

export interface AuthTokenRequest {
  grant_type: string;
  username: string;
  password: string;
}

export interface AuthTokenResponse {
  access_token?: string;
  token?: string;
  bearerToken?: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
}

export interface McpToolResult {
  content: Array<{
    type: 'text';
    text: string;
  }>;
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  data?: any;
}

export interface LogFilePaths {
  mainLog: string;
  errorLog: string;
  logsDirectory: string;
}

export interface ApiCallData {
  method?: string;
  headers?: Record<string, string>;
  payload?: any;
  status?: number;
  statusText?: string;
  data?: any;
}

export interface ToolExecutionData {
  args?: any;
  reason?: string;
  missingFields?: string[];
  error?: string;
  schemaName?: string;
  collectionName?: string;
  fieldsCount?: number;
  [key: string]: any;
}

export type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'success';

export type ToolExecutionStatus = 'START' | 'SUCCESS' | 'ERROR';

export type ApiCallDirection = 'REQUEST' | 'RESPONSE';
