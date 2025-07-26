/**
 * Update Schema Tool Definition
 */

const { updateSchema } = require('../services/updateSchema');

/**
 * Tool definition for updating an existing database schema
 */
const update_schema_tool = {
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
};

module.exports = update_schema_tool;