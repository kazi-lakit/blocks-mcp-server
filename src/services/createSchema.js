/**
 * Create Schema Tool Implementation
 */

const { ErrorCode, McpError } = require('@modelcontextprotocol/sdk/types.js');
const { debugLog } = require('../utils/logger');

/**
 * Creates a new database schema with field definitions
 * @param {Object} args - The arguments for creating a schema
 * @returns {Object} The result of the operation
 */
async function createSchema(args) {
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

module.exports = createSchema;