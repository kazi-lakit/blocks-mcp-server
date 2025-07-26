#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
    CallToolRequestSchema,
    ErrorCode,
    ListToolsRequestSchema,
    McpError,
} = require('@modelcontextprotocol/sdk/types.js');

// Import utility functions
const { debugLog } = require('./utils/logger');

// Import tools
const { createSchema, updateSchema } = require('./services');
const { create_schema_tool, update_schema_tool } = require('./tools');


class SchemaManagementServer {
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

        this.setupToolHandlers();
        debugLog('info', 'Server initialized');
    }

    setupToolHandlers() {
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
            debugLog('info', `Received call_tool request for: ${name}`, { arguments: args });

            try {
                if (name === 'create_schema') {
                    return await createSchema(args);
                } else if (name === 'update_schema') {
                    return await updateSchema(args);
                } else {
                    debugLog('error', `Unknown tool: ${name}`);
                    throw new McpError(
                        ErrorCode.MethodNotFound,
                        `Unknown tool: ${name}`
                    );
                }
            } catch (error) {
                debugLog('error', `Error executing ${name}`, { error: error.message, stack: error.stack });

                if (error instanceof McpError) {
                    throw error;
                }

                throw new McpError(
                    ErrorCode.InternalError,
                    `Error executing ${name}: ${error.message}`
                );
            }
        });
    }



    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        debugLog('info', 'Schema Management MCP server running on stdio');
    }
}

// Start the server
const server = new SchemaManagementServer();

process.on('SIGINT', async () => {
    debugLog('info', 'Received SIGINT, shutting down server');
    await server.server.close();
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    debugLog('error', 'Uncaught exception', { error: error.message, stack: error.stack });
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    debugLog('error', 'Unhandled rejection', { reason, promise });
    process.exit(1);
});

server.run().catch((error) => {
    debugLog('error', 'Server startup failed', { error: error.message, stack: error.stack });
    process.exit(1);
});