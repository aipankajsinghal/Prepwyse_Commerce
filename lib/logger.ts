/**
 * Centralized Logging Utility
 * 
 * Provides structured logging with different log levels and environments.
 * In production, errors are logged while debug/info may be suppressed.
 * 
 * Usage:
 * ```typescript
 * import { logger } from '@/lib/logger';
 * 
 * logger.info('User logged in', { userId: '123' });
 * logger.error('Failed to process payment', error, { orderId: 'abc' });
 * logger.debug('Cache hit', { key: 'user:123' });
 * ```
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  /**
   * Log debug messages (development only)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`[DEBUG] ${message}`, context || '');
    }
  }

  /**
   * Log informational messages
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, context || '');
    } else if (this.isProduction) {
      // In production, you might want to send to a logging service
      console.log(JSON.stringify({ level: 'info', message, ...context, timestamp: new Date().toISOString() }));
    }
  }

  /**
   * Log warning messages
   */
  warn(message: string, context?: LogContext): void {
    console.warn(`[WARN] ${message}`, context || '');
  }

  /**
   * Log error messages
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorDetails = error instanceof Error
      ? { message: error.message, stack: error.stack, name: error.name }
      : { error: String(error) };

    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, errorDetails, context || '');
    } else if (this.isProduction) {
      // In production, log as JSON for easier parsing
      console.error(JSON.stringify({
        level: 'error',
        message,
        ...errorDetails,
        ...context,
        timestamp: new Date().toISOString(),
      }));
    }
  }

  /**
   * Log GDPR/compliance events (always logged)
   */
  compliance(action: string, context: LogContext): void {
    console.log(`[COMPLIANCE] ${action}`, {
      ...context,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log security events (always logged)
   */
  security(action: string, context: LogContext): void {
    console.log(`[SECURITY] ${action}`, {
      ...context,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log performance metrics
   */
  performance(metric: string, value: number, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`[PERF] ${metric}: ${value}ms`, context || '');
    }
  }
}

// Export singleton instance
export const logger = new Logger();
