#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
    CallToolRequestSchema,
    ErrorCode,
    ListToolsRequestSchema,
    McpError,
} = require('@modelcontextprotocol/sdk/types.js');

// Enhanced logging function
function debugLog(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    console.error(logMessage);
    if (data) {
        console.error(JSON.stringify(data, null, 2));
    }
}

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
                {
                    name: 'create_schema',
                    description: 'Create a new database schema with field definitions',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            CollectionName: {
                                type: 'string',
                                description: 'Name of the collection',
                            },
                            SchemaName: {
                                type: 'string',
                                description: 'Name of the schema',
                            },
                            SchemaType: {
                                type: 'number',
                                description: 'Type of the schema (typically 1)',
                                default: 1,
                            },
                            Fields: {
                                type: 'array',
                                description: 'Array of field definitions',
                                items: {
                                    type: 'object',
                                    properties: {
                                        Name: {
                                            type: 'string',
                                            description: 'Field name',
                                        },
                                        Type: {
                                            type: 'string',
                                            description: 'Field type (String, Float, etc.)',
                                        },
                                    },
                                    required: ['Name', 'Type'],
                                },
                            },
                            projectKey: {
                                type: 'string',
                                description: 'Project key for API access',
                            },
                            bearerToken: {
                                type: 'string',
                                description: 'Bearer token for authorization',
                            },
                        },
                        required: ['CollectionName', 'SchemaName', 'Fields', 'projectKey', 'bearerToken'],
                    },
                },
                {
                    name: 'update_schema',
                    description: 'Update an existing database schema',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            ItemId: {
                                type: 'string',
                                description: 'GUID of the item to update',
                            },
                            CollectionName: {
                                type: 'string',
                                description: 'Name of the collection',
                            },
                            SchemaName: {
                                type: 'string',
                                description: 'Name of the schema',
                            },
                            SchemaType: {
                                type: 'number',
                                description: 'Type of the schema (typically 1)',
                                default: 1,
                            },
                            Fields: {
                                type: 'array',
                                description: 'Array of field definitions',
                                items: {
                                    type: 'object',
                                    properties: {
                                        Name: {
                                            type: 'string',
                                            description: 'Field name',
                                        },
                                        Type: {
                                            type: 'string',
                                            description: 'Field type (String, Float, etc.)',
                                        },
                                    },
                                    required: ['Name', 'Type'],
                                },
                            },
                            projectKey: {
                                type: 'string',
                                description: 'Project key for API access',
                            },
                            bearerToken: {
                                type: 'string',
                                description: 'Bearer token for authorization',
                            },
                        },
                        required: ['ItemId', 'CollectionName', 'SchemaName', 'Fields', 'projectKey', 'bearerToken'],
                    },
                },
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
                    return await this.createSchema(args);
                } else if (name === 'update_schema') {
                    return await this.updateSchema(args);
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

    async createSchema(args) {
        debugLog('info', 'Starting createSchema', { args });

        const { CollectionName, SchemaName, SchemaType = 1, Fields, projectKey, bearerToken } = args;

        // Validate required fields
        if (!CollectionName || !SchemaName || !Fields || !Array.isArray(Fields) || !projectKey || !bearerToken) {
            const missingFields = [];
            if (!CollectionName) missingFields.push('CollectionName');
            if (!SchemaName) missingFields.push('SchemaName');
            if (!Fields || !Array.isArray(Fields)) missingFields.push('Fields');
            if (!projectKey) missingFields.push('projectKey');
            if (!bearerToken) missingFields.push('bearerToken');

            debugLog('error', 'Missing required fields', { missingFields });
            throw new McpError(
                ErrorCode.InvalidParams,
                `Missing required parameters: ${missingFields.join(', ')}`
            );
        }

        // Validate Fields array
        for (const field of Fields) {
            if (!field.Name || !field.Type) {
                debugLog('error', 'Invalid field structure', { field });
                throw new McpError(
                    ErrorCode.InvalidParams,
                    'Each field must have Name and Type properties'
                );
            }
        }

        const payload = {
            CollectionName,
            SchemaName,
            SchemaType,
            Fields,
        };

        const headers = {
            'Content-Type': 'application/json',
            'x-blocks-key': projectKey,
            'Authorization': `Bearer ${bearerToken}`,
        };

        debugLog('info', 'Making API request', {
            url: 'https://dev-api.seliseblocks.com/graphql/v1/schemas/define',
            method: 'POST',
            headers: { ...headers, Authorization: 'Bearer [HIDDEN]' }, // Hide token in logs
            payload
        });

        try {
            const response = await fetch('https://dev-api.seliseblocks.com/graphql/v1/schemas/define', {
                method: 'POST',
                headers,
                body: JSON.stringify(payload),
            });

            debugLog('info', 'API response received', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
            });

            const responseText = await response.text();
            debugLog('info', 'API response body', { responseText });

            let responseData;
            try {
                responseData = JSON.parse(responseText);
                debugLog('info', 'Parsed JSON response', { responseData });
            } catch (parseError) {
                debugLog('warn', 'Could not parse response as JSON', { parseError: parseError.message });
                responseData = responseText;
            }

            if (!response.ok) {
                debugLog('error', 'API request failed', { status: response.status, responseText });
                throw new Error(`HTTP ${response.status}: ${responseText}`);
            }

            const result = {
                content: [
                    {
                        type: 'text',
                        text: `Schema "${SchemaName}" created successfully!\n\nResponse: ${JSON.stringify(responseData, null, 2)}`,
                    },
                ],
            };

            debugLog('info', 'createSchema completed successfully');
            return result;
        } catch (error) {
            debugLog('error', 'createSchema failed', { error: error.message, stack: error.stack });
            throw new McpError(
                ErrorCode.InternalError,
                `Failed to create schema: ${error.message}`
            );
        }
    }

    async updateSchema(args) {
        debugLog('info', 'Starting updateSchema', { args });

        const { ItemId, CollectionName, SchemaName, SchemaType = 1, Fields, projectKey, bearerToken } = args;

        // Validate required fields
        if (!ItemId || !CollectionName || !SchemaName || !Fields || !Array.isArray(Fields) || !projectKey || !bearerToken) {
            const missingFields = [];
            if (!ItemId) missingFields.push('ItemId');
            if (!CollectionName) missingFields.push('CollectionName');
            if (!SchemaName) missingFields.push('SchemaName');
            if (!Fields || !Array.isArray(Fields)) missingFields.push('Fields');
            if (!projectKey) missingFields.push('projectKey');
            if (!bearerToken) missingFields.push('bearerToken');

            debugLog('error', 'Missing required fields', { missingFields });
            throw new McpError(
                ErrorCode.InvalidParams,
                `Missing required parameters: ${missingFields.join(', ')}`
            );
        }

        // Validate Fields array
        for (const field of Fields) {
            if (!field.Name || !field.Type) {
                debugLog('error', 'Invalid field structure', { field });
                throw new McpError(
                    ErrorCode.InvalidParams,
                    'Each field must have Name and Type properties'
                );
            }
        }

        const payload = {
            ItemId,
            CollectionName,
            SchemaName,
            SchemaType,
            Fields,
        };

        const headers = {
            'Content-Type': 'application/json',
            'x-blocks-key': projectKey,
            'Authorization': `Bearer ${bearerToken}`,
        };

        debugLog('info', 'Making API request', {
            url: 'https://dev-api.seliseblocks.com/graphql/v1/schemas/define',
            method: 'PUT',
            headers: { ...headers, Authorization: 'Bearer [HIDDEN]' }, // Hide token in logs
            payload
        });

        try {
            const response = await fetch('https://dev-api.seliseblocks.com/graphql/v1/schemas/define', {
                method: 'PUT',
                headers,
                body: JSON.stringify(payload),
            });

            debugLog('info', 'API response received', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
            });

            const responseText = await response.text();
            debugLog('info', 'API response body', { responseText });

            let responseData;
            try {
                responseData = JSON.parse(responseText);
                debugLog('info', 'Parsed JSON response', { responseData });
            } catch (parseError) {
                debugLog('warn', 'Could not parse response as JSON', { parseError: parseError.message });
                responseData = responseText;
            }

            if (!response.ok) {
                debugLog('error', 'API request failed', { status: response.status, responseText });
                throw new Error(`HTTP ${response.status}: ${responseText}`);
            }

            const result = {
                content: [
                    {
                        type: 'text',
                        text: `Schema "${SchemaName}" updated successfully!\n\nResponse: ${JSON.stringify(responseData, null, 2)}`,
                    },
                ],
            };

            debugLog('info', 'updateSchema completed successfully');
            return result;
        } catch (error) {
            debugLog('error', 'updateSchema failed', { error: error.message, stack: error.stack });
            throw new McpError(
                ErrorCode.InternalError,
                `Failed to update schema: ${error.message}`
            );
        }
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