const { ErrorCode, McpError } = require('@modelcontextprotocol/sdk/types.js');
const { debugLog, logApiCall, logToolExecution } = require('../utils/logger');
const generateToken = require('./authService');

async function schemaOperation(args, operation = 'create') {
    const isCreate = operation === 'create';
    const logPrefix = isCreate ? 'create_schema' : 'update_schema';
    const method = isCreate ? 'POST' : 'PUT';
    const url = 'https://dev-api.seliseblocks.com/graphql/v1/schemas/define';

    // Log start
    if (isCreate) {
        logToolExecution(logPrefix, 'START', { args: { ...args, userkey: '[HIDDEN]' } });
    } else {
        debugLog('info', 'Starting updateSchema', { args: { ...args, userkey: '[HIDDEN]' } });
    }

    // Extract and validate fields
    const { ItemId, CollectionName, SchemaName, SchemaType = 1, Fields, ProjectKey, blocksKey, username, userkey } = args;
    const requiredFields = isCreate
        ? [CollectionName, SchemaName, Fields, ProjectKey, blocksKey, username, userkey]
        : [ItemId, CollectionName, SchemaName, Fields, ProjectKey, blocksKey, username, userkey];
    const requiredNames = isCreate
        ? ['CollectionName', 'SchemaName', 'Fields', 'ProjectKey', 'blocksKey', 'username', 'userkey']
        : ['ItemId', 'CollectionName', 'SchemaName', 'Fields', 'ProjectKey', 'blocksKey', 'username', 'userkey'];
    const missingFields = requiredFields.map((v, i) => v ? null : requiredNames[i]).filter(Boolean);
    if (missingFields.length > 0) {
        debugLog('error', `Missing required fields for ${logPrefix}`, { missingFields });
        if (isCreate) logToolExecution(logPrefix, 'ERROR', { reason: 'Missing required fields', missingFields });
        throw new McpError(ErrorCode.InvalidParams, `Missing required parameters: ${missingFields.join(', ')}`);
    }
    for (const field of Fields) {
        if (!field.Name || !field.Type) {
            debugLog('error', `Invalid field structure in ${logPrefix}`, { field });
            if (isCreate) logToolExecution(logPrefix, 'ERROR', { reason: 'Invalid field structure', field });
            throw new McpError(ErrorCode.InvalidParams, 'Each field must have Name and Type properties');
        }
    }

    try {
        debugLog('info', `Generating authentication token for ${logPrefix}`);
        const bearerToken = await generateToken(username, userkey, blocksKey);
        debugLog('success', `Token generated successfully for ${logPrefix}`);

        const payload = isCreate
            ? { CollectionName, SchemaName, SchemaType, Fields, ProjectKey }
            : { ItemId, CollectionName, SchemaName, SchemaType, Fields, ProjectKey };
        const headers = {
            'Content-Type': 'application/json',
            'x-blocks-key': blocksKey,
            'Authorization': `Bearer ${bearerToken}`,
        };

        // Log API request
        if (isCreate) {
            logApiCall('REQUEST', url, { method, headers: { ...headers, Authorization: 'Bearer [HIDDEN]' }, payload });
        } else {
            debugLog('info', 'Making API request', { url, method, headers: { ...headers, Authorization: 'Bearer [HIDDEN]' }, payload });
        }

        const response = await fetch(url, { method, headers, body: JSON.stringify(payload) });
        debugLog('info', `${isCreate ? 'Schema creation' : 'Schema update'} API response received`, {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
        });
        const responseText = await response.text();
        debugLog('info', `${isCreate ? 'Schema creation' : 'Schema update'} API response body received`);

        let responseData;
        try {
            responseData = JSON.parse(responseText);
            debugLog('info', `Successfully parsed JSON response from ${logPrefix} API`, { responseData });
        } catch (parseError) {
            debugLog('warn', `Could not parse ${logPrefix} response as JSON`, { parseError: parseError.message, responseText });
            responseData = responseText;
        }

        // Log API response
        if (isCreate) {
            logApiCall('RESPONSE', url, { status: response.status, statusText: response.statusText, data: responseData });
        }

        if (!response.ok) {
            debugLog('error', `${isCreate ? 'Schema creation' : 'Schema update'} API request failed`, { status: response.status, responseText });
            if (isCreate) logToolExecution(logPrefix, 'ERROR', { reason: 'API request failed', status: response.status, response: responseText });
            throw new Error(`HTTP ${response.status}: ${responseText}`);
        }

        const result = {
            content: [
                {
                    type: 'text',
                    text: `${isCreate ? '✅ Schema' : 'Schema'} \"${SchemaName}\" ${isCreate ? 'created' : 'updated'} successfully!\n\nResponse: ${JSON.stringify(responseData, null, 2)}`,
                },
            ],
        };

        debugLog('success', `${isCreate ? '🎉 Schema' : 'Schema'} \"${SchemaName}\" ${isCreate ? 'created' : 'updated'} successfully`);
        if (isCreate) {
            logToolExecution(logPrefix, 'SUCCESS', { schemaName: SchemaName, collectionName: CollectionName, fieldsCount: Fields.length });
        }
        return result;
    } catch (error) {
        debugLog('error', `${isCreate ? '💥 createSchema' : 'updateSchema'} operation failed`, { error: error.message, stack: error.stack });
        if (isCreate) {
            logToolExecution(logPrefix, 'ERROR', { error: error.message, schemaName: SchemaName, collectionName: CollectionName });
        }
        throw new McpError(ErrorCode.InternalError, `Failed to ${isCreate ? 'create' : 'update'} schema: ${error.message}`);
    }
}

async function createSchema(args) {
    return schemaOperation(args, 'create');
}

async function updateSchema(args) {
    return schemaOperation(args, 'update');
}

module.exports = { createSchema, updateSchema };