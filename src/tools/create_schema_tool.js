/**
 * Create Schema Tool Definition
 */

const { createSchema } = require('../services/createSchema');

/**
 * Tool definition for creating a new database schema
 */
const create_schema_tool = {
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
};

module.exports = create_schema_tool;