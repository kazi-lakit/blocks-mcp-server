/**
 * Update Schema Tool Implementation
 */

const { ErrorCode, McpError } = require('@modelcontextprotocol/sdk/types.js');
const { debugLog } = require('../utils/logger');

/**
 * Updates an existing database schema
 * @param {Object} args - The arguments for updating a schema
 * @returns {Object} The result of the operation
 */
async function updateSchema(args) {
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

module.exports = updateSchema;