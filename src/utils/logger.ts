/**
 * Enhanced Logger utility functions with file logging
 */

import * as fs from 'fs';
import * as path from 'path';
import { 
  LogLevel, 
  LogFilePaths, 
  ApiCallDirection, 
  ApiCallData, 
  ToolExecutionStatus, 
  ToolExecutionData 
} from '../types';

class Logger {
  private logsDir: string;
  private logFile: string;
  private errorLogFile: string;

  constructor() {
    // Create logs directory if it doesn't exist
    this.logsDir = path.join(__dirname, '../../logs');
    this.ensureLogsDirectory();

    // Generate log file names based on current date
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    this.logFile = path.join(this.logsDir, `mcp-server-${today}.log`);
    this.errorLogFile = path.join(this.logsDir, `mcp-server-error-${today}.log`);

    // Initialize log files with headers
    this.initializeLogFiles();
  }

  /**
   * Ensure logs directory exists
   */
  private ensureLogsDirectory(): void {
    try {
      if (!fs.existsSync(this.logsDir)) {
        fs.mkdirSync(this.logsDir, { recursive: true });
        console.log(`Created logs directory: ${this.logsDir}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to create logs directory: ${errorMessage}`);
    }
  }

  /**
   * Initialize log files with session headers
   */
  private initializeLogFiles(): void {
    const sessionHeader = `\\n${'='.repeat(80)}\\n📅 Session started at: ${new Date().toISOString()}\\n${'='.repeat(80)}\\n`;

    try {
      // Append session header to main log file
      fs.appendFileSync(this.logFile, sessionHeader);

      // Append session header to error log file
      fs.appendFileSync(this.errorLogFile, sessionHeader);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Failed to initialize log files: ${errorMessage}`);
    }
  }

  /**
   * Write log entry to file
   * @param filePath - Path to log file
   * @param logEntry - Formatted log entry
   */
  private writeToFile(filePath: string, logEntry: string): void {
    try {
      fs.appendFileSync(filePath, logEntry + '\\n');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Failed to write to log file ${filePath}: ${errorMessage}`);
    }
  }

  /**
   * Format log entry
   * @param level - Log level
   * @param message - Log message
   * @param data - Optional data
   * @returns Formatted log entry
   */
  private formatLogEntry(level: LogLevel, message: string, data: any = null): string {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    let logEntry = logMessage;
    if (data) {
      logEntry += '\\n' + JSON.stringify(data, null, 2);
    }

    return logEntry;
  }

  /**
   * Enhanced logging function for debugging
   * @param level - Log level (info, warn, error, debug, etc.)
   * @param message - Log message
   * @param data - Optional data to log
   */
  debugLog(level: LogLevel, message: string, data: any = null): void {
    const logEntry = this.formatLogEntry(level, message, data);

    // Always write to main log file
    this.writeToFile(this.logFile, logEntry);

    // Write errors to separate error log file
    if (level.toLowerCase() === 'error') {
      this.writeToFile(this.errorLogFile, logEntry);
    }
  }

  /**
   * Log request/response for API calls
   * @param direction - 'REQUEST' or 'RESPONSE'
   * @param url - API endpoint
   * @param data - Request/response data
   */
  logApiCall(direction: ApiCallDirection, url: string, data: ApiCallData | null = null): void {
    const message = `${direction}: ${url}`;
    this.debugLog('info', message, data);
  }

  /**
   * Log tool execution
   * @param toolName - Name of the tool
   * @param status - 'START', 'SUCCESS', or 'ERROR'
   * @param data - Tool data
   */
  logToolExecution(toolName: string, status: ToolExecutionStatus, data: ToolExecutionData | null = null): void {
    const level: LogLevel = status === 'ERROR' ? 'error' : 'info';
    const message = `Tool ${toolName} - ${status}`;
    this.debugLog(level, message, data);
  }

  /**
   * Get log file paths for reference
   * @returns Object with log file paths
   */
  getLogFilePaths(): LogFilePaths {
    return {
      mainLog: this.logFile,
      errorLog: this.errorLogFile,
      logsDirectory: this.logsDir
    };
  }

  /**
   * Clean up old log files (older than specified days)
   * @param daysToKeep - Number of days to keep logs (default: 7)
   */
  cleanupOldLogs(daysToKeep: number = 7): void {
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.debugLog('error', 'Failed to cleanup old logs', { error: errorMessage });
    }
  }
}

// Create singleton instance
const logger = new Logger();

// Export the debugLog function for backward compatibility
export const debugLog = (level: LogLevel, message: string, data: any = null): void => {
  logger.debugLog(level, message, data);
};

// Export enhanced logger functions
export {
  logger,
};

export const logApiCall = (direction: ApiCallDirection, url: string, data?: ApiCallData): void => 
  logger.logApiCall(direction, url, data);

export const logToolExecution = (toolName: string, status: ToolExecutionStatus, data?: ToolExecutionData): void => 
  logger.logToolExecution(toolName, status, data);

export const getLogFilePaths = (): LogFilePaths => 
  logger.getLogFilePaths();

export const cleanupOldLogs = (days?: number): void => 
  logger.cleanupOldLogs(days);
