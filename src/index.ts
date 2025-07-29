#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

// Import utility functions
import { debugLog, getLogFilePaths, cleanupOldLogs } from './utils/logger';

// Import tools
import { createSchema, updateSchema } from './services';
import { create_schema_tool, update_schema_tool } from './tools';
import { CreateSchemaArgs, Field, UpdateSchemaArgs } from './types';

interface ServerCredentials {
  blocksKey?: string;
  username?: string;
  userkey?: string;
  apiBaseUrl?: string;
}

class SchemaManagementServer {
  private server: Server;
  private apiBaseUrl?: string;
  private blocksKey?: string;
  private username?: string;
  private userkey?: string;

  constructor() {
    this.server = new Server(
      {
        name: 'schema-management-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Read environment variables
    this.blocksKey = process.env.BLOCKS_KEY;
    this.username = process.env.USERNAME;
    this.userkey = process.env.USER_KEY;
    this.apiBaseUrl = process.env.API_BASE_URL;

    debugLog('info', 'Environment variables loaded', {
      projectKey: this.blocksKey ? '[SET]' : '[NOT SET]',
      username: this.username ? '[SET]' : '[NOT SET]',
      userkey: this.userkey ? '[SET]' : '[NOT SET]',
      apiBaseUrl: this.apiBaseUrl ? '[SET]' : '[NOT SET]'
    });

    // Log file paths for reference
    const logPaths = getLogFilePaths();
    debugLog('info', '📁 Log files initialized', logPaths);

    // Clean up old log files (keep last 7 days)
    cleanupOldLogs(7);

    this.setupToolHandlers();
    debugLog('info', 'Server initialized');
  }

  private setupToolHandlers(): void {
    // Handle list_tools request
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      debugLog('info', 'Received list_tools request');

      const tools = [
        create_schema_tool,
        update_schema_tool
      ];

      debugLog('info', 'Returning tools list', { toolCount: tools.length });
      return { tools };
    });

    // Handle call_tool request
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      debugLog('info', `Received call_tool request for: ${name}`, { 
        arguments: { ...args, userkey: '[HIDDEN]' } 
      });

      try {
        const promptArgs = args ?? {};
        // // Automatically inject environment variables into args
        // const enrichedArgs = {
        //   ...sArgs
        // };

        // // Validate that we have all required credentials
        // if (!enrichedArgs.blocksKey || !enrichedArgs.username || !enrichedArgs.userkey) {
        //   const missing: string[] = [];
        //   if (!enrichedArgs.blocksKey) missing.push('blocksKey');
        //   if (!enrichedArgs.username) missing.push('username');
        //   if (!enrichedArgs.userkey) missing.push('userkey');

        //   debugLog('error', 'Missing credentials', { missing });
        //   throw new McpError(
        //     ErrorCode.InvalidParams,
        //     `Missing required credentials: ${missing.join(', ')}. Please check your MCP configuration.`
        //   );
        // }
 
        

        if (name === 'create_schema') {
          const result = await createSchema(promptArgs);
          return result as any;
        } else if (name === 'update_schema') {
          const result = await updateSchema(promptArgs);
          return result as any;
        } else {
          debugLog('error', `Unknown tool: ${name}`);
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${name}`
          );
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : undefined;
        
        debugLog('error', `Error executing ${name}`, { 
          error: errorMessage, 
          stack: errorStack 
        });

        if (error instanceof McpError) {
          throw error;
        }

        throw new McpError(
          ErrorCode.InternalError,
          `Error executing ${name}: ${errorMessage}`
        );
      }
    });
  }

  

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    debugLog('info', 'Schema Management MCP server running on stdio');
  }

  async close(): Promise<void> {
    await this.server.close();
  }
}

// Start the server
const server = new SchemaManagementServer();

process.on('SIGINT', async () => {
  debugLog('info', 'Received SIGINT, shutting down server');
  await server.close();
  process.exit(0);
});

process.on('uncaughtException', (error: Error) => {
  debugLog('error', 'Uncaught exception', { 
    error: error.message, 
    stack: error.stack 
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  debugLog('error', 'Unhandled rejection', { reason, promise });
  process.exit(1);
});

server.run().catch((error: Error) => {
  debugLog('error', 'Server startup failed', { 
    error: error.message, 
    stack: error.stack 
  });
  process.exit(1);
});
