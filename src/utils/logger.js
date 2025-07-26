/**
 * Logger utility functions
 */

/**
 * Enhanced logging function for debugging
 * @param {string} level - Log level (info, warn, error, etc.)
 * @param {string} message - Log message
 * @param {Object|null} data - Optional data to log
 */
function debugLog(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    console.error(logMessage);
    if (data) {
        console.error(JSON.stringify(data, null, 2));
    }
}

module.exports = {
    debugLog
};