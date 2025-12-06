/**
 * Application Initialization
 *
 * This file should be imported at the very start of the application
 * to perform initialization tasks like environment validation.
 */

import { validateEnv } from './env';
import { logger } from './logger';

/**
 * Initialize the application
 * Should be called once at startup
 */
export function initializeApp(): void {
  try {
    // Validate environment variables
    validateEnv();

    // Log startup information
    const env = process.env.NODE_ENV || 'development';
    logger.info(`Application starting in ${env} mode`);

    // Perform other initialization tasks as needed
    if (process.env.NODE_ENV === 'production') {
      logger.info('Running in production mode - ensure all monitoring is configured');
    }
  } catch (error) {
    logger.error('Failed to initialize application', error);
    // Exit process on initialization error
    process.exit(1);
  }
}

/**
 * One-time initialization
 */
let initialized = false;

/**
 * Initialize app (runs only once)
 */
export function ensureInitialized(): void {
  if (!initialized) {
    initializeApp();
    initialized = true;
  }
}
