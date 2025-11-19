/**
 * API Error Handling Utilities
 * 
 * Provides consistent error handling across API routes with proper typing.
 * Replaces `catch (error: any)` pattern with type-safe error handling.
 * 
 * Usage:
 * ```typescript
 * import { handleApiError, ApiError } from '@/lib/api-error-handler';
 * 
 * try {
 *   // ... code that might throw
 * } catch (error) {
 *   return handleApiError(error, 'Failed to process request');
 * }
 * ```
 */

import { NextResponse } from 'next/server';
import { logger } from './logger';

/**
 * Custom API Error class for application-specific errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Extract error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
}

/**
 * Check if error is an API error
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Handle API errors with proper logging and response formatting
 * 
 * @param error - The caught error (unknown type)
 * @param defaultMessage - Default message if error has no message
 * @param context - Additional context for logging
 * @returns NextResponse with appropriate error response
 */
export function handleApiError(
  error: unknown,
  defaultMessage: string = 'Internal server error',
  context?: Record<string, any>
): NextResponse {
  // Handle custom ApiError
  if (isApiError(error)) {
    logger.error(error.message, error, context);
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  // Handle standard Error
  if (error instanceof Error) {
    logger.error(defaultMessage, error, context);
    return NextResponse.json(
      { error: error.message || defaultMessage },
      { status: 500 }
    );
  }

  // Handle unknown error types
  const message = getErrorMessage(error);
  logger.error(defaultMessage, new Error(message), context);
  return NextResponse.json(
    { error: message || defaultMessage },
    { status: 500 }
  );
}

/**
 * Validation error helper
 */
export function validationError(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}

/**
 * Not found error helper
 */
export function notFoundError(resource: string): NextResponse {
  return NextResponse.json(
    { error: `${resource} not found` },
    { status: 404 }
  );
}

/**
 * Unauthorized error helper
 */
export function unauthorizedError(message: string = 'Unauthorized'): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 });
}

/**
 * Forbidden error helper
 */
export function forbiddenError(message: string = 'Forbidden'): NextResponse {
  return NextResponse.json({ error: message }, { status: 403 });
}
