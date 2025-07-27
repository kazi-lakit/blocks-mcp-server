/**
 * Enhanced Logger utility functions with file logging
 */

const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        // Create logs directory if it doesn't exist
        this.logsDir = path.join(__dirname, '../../logs');
        this.ensureLogsDirectory();

        // Generate log file names based on current date
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        // console.log("logsDir: ", this.logsDir)
        this.logFile = path.join(this.logsDir, `mcp-server-${today}.log`);
        this.errorLogFile = path.join(this.logsDir, `mcp-server-error-${today}.log`);

        // Initialize log files with headers
        this.initializeLogFiles();
    }

    /**
     * Ensure logs directory exists
     */
    ensureLogsDirectory() {
        try {
            if (!fs.existsSync(this.logsDir)) {
                fs.mkdirSync(this.logsDir, { recursive: true });
                console.log(`Created logs directory: ${this.logsDir}`);
            }
        } catch (error) {
            console.error(`Failed to create logs directory: ${error.message}`);
        }
    }

    /**
     * Initialize log files with session headers
     */
    initializeLogFiles() {
        const sessionHeader = `\n${'='.repeat(80)}\n📅 Session started at: ${new Date().toISOString()}\n${'='.repeat(80)}\n`;

        try {
            // Append session header to main log file
            fs.appendFileSync(this.logFile, sessionHeader);

            // Append session header to error log file
            fs.appendFileSync(this.errorLogFile, sessionHeader);
        } catch (error) {
            console.error(`❌ Failed to initialize log files: ${error.message}`);
        }
    }

    /**
     * Write log entry to file
     * @param {string} filePath - Path to log file
     * @param {string} logEntry - Formatted log entry
     */
    writeToFile(filePath, logEntry) {
        try {
            fs.appendFileSync(filePath, logEntry + '\n');
        } catch (error) {
            console.error(`❌ Failed to write to log file ${filePath}: ${error.message}`);
        }
    }

    /**
     * Format log entry
     * @param {string} level - Log level
     * @param {string} message - Log message
     * @param {Object|null} data - Optional data
     * @returns {string} Formatted log entry
     */
    formatLogEntry(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

        let logEntry = logMessage;
        if (data) {
            logEntry += '\n' + JSON.stringify(data, null, 2);
        }

        return logEntry;
    }

    /**
     * Enhanced logging function for debugging
     * @param {string} level - Log level (info, warn, error, debug, etc.)
     * @param {string} message - Log message
     * @param {Object|null} data - Optional data to log
     */
    debugLog(level, message, data = null) {
        const logEntry = this.formatLogEntry(level, message, data);

        // Always write to main log file
        this.writeToFile(this.logFile, logEntry);

        // Write errors to separate error log file
        if (level.toLowerCase() === 'error') {
            this.writeToFile(this.errorLogFile, logEntry);
        }

        // Also output to console with color coding
        // const colorCodes = {
        //     error: '\x1b[31m',   // Red
        //     warn: '\x1b[33m',    // Yellow
        //     info: '\x1b[36m',    // Cyan
        //     debug: '\x1b[35m',   // Magenta
        //     success: '\x1b[32m', // Green
        //     reset: '\x1b[0m'     // Reset
        // };

        // const color = colorCodes[level.toLowerCase()] || colorCodes.reset;
        // const resetColor = colorCodes.reset;

        // console.log(`${color}${logEntry}${resetColor}`);
    }

    /**
     * Log request/response for API calls
     * @param {string} direction - 'REQUEST' or 'RESPONSE'
     * @param {string} url - API endpoint
     * @param {Object} data - Request/response data
     */
    logApiCall(direction, url, data = null) {
        const message = `${direction}: ${url}`;
        this.debugLog('info', message, data);
    }

    /**
     * Log tool execution
     * @param {string} toolName - Name of the tool
     * @param {string} status - 'START', 'SUCCESS', or 'ERROR'
     * @param {Object} data - Tool data
     */
    logToolExecution(toolName, status, data = null) {
        const level = status === 'ERROR' ? 'error' : 'info';
        const message = `Tool ${toolName} - ${status}`;
        this.debugLog(level, message, data);
    }

    /**
     * Get log file paths for reference
     * @returns {Object} Object with log file paths
     */
    getLogFilePaths() {
        return {
            mainLog: this.logFile,
            errorLog: this.errorLogFile,
            logsDirectory: this.logsDir
        };
    }

    /**
     * Clean up old log files (older than specified days)
     * @param {number} daysToKeep - Number of days to keep logs (default: 7)
     */
    cleanupOldLogs(daysToKeep = 7) {
        try {
            const files = fs.readdirSync(this.logsDir);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

            let deletedCount = 0;
            files.forEach(file => {
                const filePath = path.join(this.logsDir, file);
                const stats = fs.statSync(filePath);

                if (stats.mtime < cutoffDate && file.endsWith('.log')) {
                    fs.unlinkSync(filePath);
                    deletedCount++;
                    this.debugLog('info', `Deleted old log file: ${file}`);
                }
            });

            if (deletedCount > 0) {
                this.debugLog('info', `Cleaned up ${deletedCount} old log files`);
            }
        } catch (error) {
            this.debugLog('error', 'Failed to cleanup old logs', { error: error.message });
        }
    }
}

// Create singleton instance
const logger = new Logger();

// Export the debugLog function for backward compatibility
const debugLog = (level, message, data = null) => {
    logger.debugLog(level, message, data);
};

// Export enhanced logger functions
module.exports = {
    debugLog,
    logger,
    logApiCall: (direction, url, data) => logger.logApiCall(direction, url, data),
    logToolExecution: (toolName, status, data) => logger.logToolExecution(toolName, status, data),
    getLogFilePaths: () => logger.getLogFilePaths(),
    cleanupOldLogs: (days) => logger.cleanupOldLogs(days)
};