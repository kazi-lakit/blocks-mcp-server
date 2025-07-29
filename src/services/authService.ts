/**
 * Token Service Implementation
 */

import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { debugLog, logApiCall } from '../utils/logger';
import { AuthTokenResponse } from '../types';


async function generateToken(): Promise<string> {
  const username = process.env.USERNAME;
  const userkey = process.env.USER_KEY;
  const blocksKey = process.env.BLOCKS_KEY;
  const apiBaseUrl = process.env.API_BASE_URL;

  debugLog('info', '🔐 Starting token generation process', { username, blocksKey });

  // Validate required fields
  if (!username || !userkey || !blocksKey || !apiBaseUrl) {
    const missingFields: string[] = [];
    if (!username) missingFields.push('username');
    if (!userkey) missingFields.push('userkey');
    if (!blocksKey) missingFields.push('blocksKey');
    if (!apiBaseUrl) missingFields.push('apiBaseUrl');

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

  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'x-blocks-key': blocksKey
  };

  const tokenUrl = `${apiBaseUrl}/authentication/v1/OAuth/Token`;

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

    let responseData: AuthTokenResponse;
    try {
      responseData = JSON.parse(responseText) as AuthTokenResponse;
      debugLog('info', '✅ Successfully parsed token JSON response');
    } catch (parseError) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error';
      debugLog('error', '❌ Could not parse token response as JSON', {
        parseError: errorMessage,
        responseText
      });
      throw new Error('Invalid JSON response from token endpoint');
    }

    // Log API response (hide token in logs)
    logApiCall('RESPONSE', tokenUrl, {
      status: response.status,
      statusText: response.statusText
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    debugLog('error', '💥 Token generation failed', {
      error: errorMessage,
      stack: errorStack,
      err: error
    });
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to generate token: ${errorMessage}`
    );
  }
}

export default generateToken;
