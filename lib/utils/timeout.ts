/**
 * Timeout Utilities
 * 
 * Provides utilities for wrapping promises with timeouts to prevent hung requests.
 * Essential for long-running operations like AI API calls and external service requests.
 */

/**
 * Wraps a promise with a timeout
 * 
 * @param promise - The promise to wrap
 * @param timeoutMs - Timeout in milliseconds (default: 30000 = 30 seconds)
 * @param errorMessage - Custom error message for timeout
 * @returns Promise that rejects if timeout is reached
 * 
 * @example
 * ```typescript
 * const result = await withTimeout(
 *   fetchDataFromAPI(),
 *   5000,
 *   'API request timeout'
 * );
 * ```
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 30000,
  errorMessage: string = 'Request timeout'
): Promise<T> {
  const timeoutPromise = new Promise<T>((_, reject) => {
    setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

/**
 * Timeout specifically for AI API requests (longer timeout)
 * Default: 60 seconds
 * 
 * @example
 * ```typescript
 * const questions = await withAITimeout(
 *   generateAIQuestions({ ... })
 * );
 * ```
 */
export async function withAITimeout<T>(promise: Promise<T>): Promise<T> {
  return withTimeout(
    promise,
    60000, // 60 seconds
    'AI request timeout - please try again with fewer questions or simpler parameters'
  );
}

/**
 * Timeout for database operations
 * Default: 10 seconds
 * 
 * @example
 * ```typescript
 * const users = await withDBTimeout(
 *   prisma.user.findMany({ ... })
 * );
 * ```
 */
export async function withDBTimeout<T>(promise: Promise<T>): Promise<T> {
  return withTimeout(
    promise,
    10000, // 10 seconds
    'Database operation timeout - please try again'
  );
}

/**
 * Timeout for external API calls (excluding AI)
 * Default: 15 seconds
 * 
 * @example
 * ```typescript
 * const payment = await withAPITimeout(
 *   razorpay.orders.create({ ... })
 * );
 * ```
 */
export async function withAPITimeout<T>(promise: Promise<T>): Promise<T> {
  return withTimeout(
    promise,
    15000, // 15 seconds
    'External API timeout - please try again'
  );
}

/**
 * Check if an error is a timeout error
 * 
 * @param error - Error to check
 * @returns true if the error is a timeout error
 */
export function isTimeoutError(error: unknown): boolean {
  return error instanceof Error && error.message.toLowerCase().includes('timeout');
}
