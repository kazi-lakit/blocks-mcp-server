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
const { debugLog, getLogFilePaths, cleanupOldLogs } = require('./utils/logger');

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

        // Read environment variables
        this.blocksKey = process.env.BLOCKS_KEY;
        this.username = process.env.USERNAME;
        this.userkey = process.env.USER_KEY;

        debugLog('info', 'Environment variables loaded', {
            projectKey: this.blocksKey ? '[SET]' : '[NOT SET]',
            username: this.username ? '[SET]' : '[NOT SET]',
            userkey: this.userkey ? '[SET]' : '[NOT SET]'
        });

        // Log file paths for reference
        const logPaths = getLogFilePaths();
        debugLog('info', '📁 Log files initialized', logPaths);

        // Clean up old log files (keep last 7 days)
        cleanupOldLogs(7);

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
            debugLog('info', `Received call_tool request for: ${name}`, { arguments: { ...args, userkey: '[HIDDEN]' } });

            try {
                // Automatically inject environment variables into args
                const enrichedArgs = {
                    ...args,
                    blocksKey: args.blocksKey || this.blocksKey,
                    username: args.username || this.username,
                    userkey: args.userkey || this.userkey
                };

                // Validate that we have all required credentials
                if (!enrichedArgs.blocksKey || !enrichedArgs.username || !enrichedArgs.userkey) {
                    const missing = [];
                    if (!enrichedArgs.blocksKey) missing.push('blocksKey');
                    if (!enrichedArgs.username) missing.push('username');
                    if (!enrichedArgs.userkey) missing.push('userkey');

                    debugLog('error', 'Missing credentials', { missing });
                    throw new McpError(
                        ErrorCode.InvalidParams,
                        `Missing required credentials: ${missing.join(', ')}. Please check your MCP configuration.`
                    );
                }

                if (name === 'create_schema') {
                    return await createSchema(enrichedArgs);
                } else if (name === 'update_schema') {
                    return await updateSchema(enrichedArgs);
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