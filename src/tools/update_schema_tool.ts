/**
 * Update Schema Tool Definition with Token Generation
 */

import { ToolDefinition } from '../types';

/**
 * Tool definition for updating an existing database schema
 */
const update_schema_tool: ToolDefinition = {
  name: 'update_schema',
  description: 'Update an existing database schema with new field definitions',
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
            IsArray: {
              type: 'boolean',
              description: 'Indicates if the field is an array',
            }
          },
          required: ['Name', 'Type'],
        },
      },
      ProjectKey: {
        type: 'string',
        description: 'Project key for API access',
      }
    },
    required: ['ItemId', 'CollectionName', 'SchemaName', 'Fields', 'ProjectKey']
  }
};

export default update_schema_tool;
