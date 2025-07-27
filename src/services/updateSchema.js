/**
 * Update Schema Service Implementation with Token Generation
 */

const { ErrorCode, McpError } = require('@modelcontextprotocol/sdk/types.js');
const { debugLog } = require('../utils/logger');
const generateToken = require('./authService');

/**
 * Updates an existing database schema
 * @param {Object} args - The arguments for updating a schema
 * @returns {Object} The result of the operation
 */
async function updateSchema(args) {
    debugLog('info', 'Starting updateSchema', { args: { ...args, userkey: '[HIDDEN]' } });

    const { ItemId, CollectionName, SchemaName, SchemaType = 1, Fields, ProjectKey, blocksKey, username, userkey } = args;

    // Validate required fields (now including username and userkey instead of bearerToken)
    if (!ItemId || !CollectionName || !SchemaName || !Fields || !Array.isArray(Fields) || !ProjectKey || !blocksKey || !username || !userkey) {
        const missingFields = [];
        if (!ItemId) missingFields.push('ItemId');
        if (!CollectionName) missingFields.push('CollectionName');
        if (!SchemaName) missingFields.push('SchemaName');
        if (!Fields || !Array.isArray(Fields)) missingFields.push('Fields');
        if (!ProjectKey) missingFields.push('ProjectKey');
        if (!blocksKey) missingFields.push('blocksKey');
        if (!username) missingFields.push('username');
        if (!userkey) missingFields.push('userkey');

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

    try {
        // Generate token first
        debugLog('info', 'Generating authentication token');
        const bearerToken = await generateToken(username, userkey, blocksKey);
        debugLog('info', 'Token generated successfully');

        const payload = {
            ItemId,
            CollectionName,
            SchemaName,
            SchemaType,
            Fields,
            ProjectKey
        };

        const headers = {
            'Content-Type': 'application/json',
            'x-blocks-key': blocksKey,
            'Authorization': `Bearer ${bearerToken}`,
        };

        const requestUrl = 'https://dev-api.seliseblocks.com/graphql/v1/schemas/define';

        debugLog('info', 'Making API request', {
            url: requestUrl,
            method: 'PUT',
            headers: { ...headers, Authorization: 'Bearer [HIDDEN]' }, // Hide token in logs
            payload
        });

        const response = await fetch(requestUrl, {
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