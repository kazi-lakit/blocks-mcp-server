/**
 * Token Service Implementation
 */

const { ErrorCode, McpError } = require('@modelcontextprotocol/sdk/types.js');
const { debugLog, logApiCall } = require('../utils/logger');

/**
 * Generates an authentication token using username and userkey
 * @param {string} username - Username for authentication
 * @param {string} userkey - User key for authentication
 * @param {string} blocksKey - Project key for authentication
 * @returns {Promise<string>} The bearer token
 */
async function generateToken(username, userkey, blocksKey) {
    debugLog('info', '🔐 Starting token generation process', { username, blocksKey });

    // Validate required fields
    if (!username || !userkey || !blocksKey) {
        const missingFields = [];
        if (!username) missingFields.push('username');
        if (!userkey) missingFields.push('userkey');
        if (!blocksKey) missingFields.push('blocksKey');

        debugLog('error', '❌ Missing required fields for token generation', { missingFields });
        throw new McpError(
            ErrorCode.InvalidParams,
            `Missing required parameters: ${missingFields.join(', ')}`
        );
    }

    // Create URL-encoded payload
    const formData = new URLSearchParams();
    formData.append('grant_type', 'password'); // Hard-coded as requested
    formData.append('username', username);
    formData.append('password', userkey);

    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-blocks-key': blocksKey
    };

    const tokenUrl = 'https://dev-api.seliseblocks.com/authentication/v1/OAuth/Token';

    // Log API request (hide sensitive data)
    logApiCall('REQUEST', tokenUrl, {
        method: 'POST',
        headers,
        payload: `granttype=password&username=${username}&password=[HIDDEN]`
    });

    debugLog('info', '🌐 Making token generation API request', {
        url: tokenUrl,
        method: 'POST',
        username
    });

    try {
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers,
            body: formData.toString(),
        });

        debugLog('info', '📥 Token API response received', {
            status: response.status,
            statusText: response.statusText,
        });

        const responseText = await response.text();
        debugLog('info', '📄 Token API response body received');

        let responseData;
        try {
            responseData = JSON.parse(responseText);
            debugLog('info', '✅ Successfully parsed token JSON response');
        } catch (parseError) {
            debugLog('error', '❌ Could not parse token response as JSON', {
                parseError: parseError.message,
                responseText
            });
            throw new Error('Invalid JSON response from token endpoint');
        }

        // Log API response (hide token in logs)
        logApiCall('RESPONSE', tokenUrl, {
            status: response.status,
            statusText: response.statusText,
            hasToken: !!(responseData.access_token || responseData.token || responseData.bearerToken)
        });

        if (!response.ok) {
            debugLog('error', '❌ Token API request failed', {
                status: response.status,
                response: responseText
            });
            throw new Error(`Token generation failed: HTTP ${response.status}`);
        }

        // Extract token from response (adjust field name as per your API response structure)
        const token = responseData.access_token || responseData.token || responseData.bearerToken;

        if (!token) {
            debugLog('error', '❌ No token found in API response', {
                availableFields: Object.keys(responseData)
            });
            throw new Error('No token found in API response');
        }

        debugLog('success', '🎉 Token generated successfully');
        return token;

    } catch (error) {
        debugLog('error', '💥 Token generation failed', {
            error: error.message,
            stack: error.stack,
            err: error
        });
        throw new McpError(
            ErrorCode.InternalError,
            `Failed to generate token: ${error.message}`
        );
    }
}

module.exports = generateToken;