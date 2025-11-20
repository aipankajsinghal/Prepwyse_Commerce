/**
 * Request Logging Middleware
 * 
 * Logs API requests with timing, status codes, and error information.
 * Integrates with the centralized logger utility.
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export interface RequestLogData {
  method: string;
  url: string;
  statusCode: number;
  duration: number;
  userAgent?: string;
  ip?: string;
  userId?: string;
  error?: string;
}

/**
 * Get client IP from request headers
 */
function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Get user ID from request (if available from auth)
 */
function getUserId(req: NextRequest): string | undefined {
  // Try to extract from authorization header
  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    // This is a simple extraction - adjust based on your auth implementation
    const parts = authHeader.split(" ");
    if (parts.length === 2) {
      return parts[1].substring(0, 8); // Return first 8 chars for privacy
    }
  }
  return undefined;
}

/**
 * Log request with timing information
 */
export async function logRequest(
  req: NextRequest,
  response: NextResponse,
  startTime: number
): Promise<void> {
  const duration = Date.now() - startTime;
  const statusCode = response.status;
  
  const logData: RequestLogData = {
    method: req.method,
    url: req.nextUrl.pathname,
    statusCode,
    duration,
    userAgent: req.headers.get("user-agent") || undefined,
    ip: getClientIp(req),
    userId: getUserId(req),
  };

  // Log based on status code
  if (statusCode >= 500) {
    logger.error("API Request Failed", new Error(`${statusCode} error`), logData);
  } else if (statusCode >= 400) {
    logger.warn("API Request Error", logData);
  } else if (duration > 5000) {
    // Warn on slow requests (>5s)
    logger.warn("Slow API Request", logData);
  } else {
    logger.info("API Request", logData);
  }
}

/**
 * Higher-order function to wrap API routes with request logging
 * 
 * @example
 * ```typescript
 * import { withRequestLogging } from '@/lib/middleware/logger';
 * 
 * export const GET = withRequestLogging(async (req) => {
 *   // Handler implementation
 *   return NextResponse.json({ data: 'result' });
 * });
 * ```
 */
export function withRequestLogging(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>
): (req: NextRequest, context?: any) => Promise<NextResponse> {
  return async (req: NextRequest, context?: any) => {
    const startTime = Date.now();

    try {
      // Call the handler
      const response = await handler(req, context);
      
      // Log the request
      await logRequest(req, response, startTime);
      
      return response;
    } catch (error) {
      // Log the error
      const duration = Date.now() - startTime;
      logger.error("API Request Exception", error as Error, {
        method: req.method,
        url: req.nextUrl.pathname,
        duration,
        ip: getClientIp(req),
      });
      
      // Re-throw the error
      throw error;
    }
  };
}

/**
 * Combined middleware for rate limiting and request logging
 * 
 * @example
 * ```typescript
 * import { withRateLimitAndLogging } from '@/lib/middleware/logger';
 * import { strictRateLimit } from '@/lib/middleware/rateLimit';
 * 
 * export const POST = withRateLimitAndLogging(async (req) => {
 *   // Handler implementation
 * }, strictRateLimit);
 * ```
 */
export function withRateLimitAndLogging(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
  rateLimiter?: (req: NextRequest) => Promise<any>
): (req: NextRequest, context?: any) => Promise<NextResponse> {
  return async (req: NextRequest, context?: any) => {
    const startTime = Date.now();

    try {
      // Apply rate limiting if provided
      if (rateLimiter) {
        const limitResult = await rateLimiter(req);
        
        if (!limitResult.success) {
          const response = NextResponse.json(
            {
              error: "Too many requests. Please try again later.",
              limit: limitResult.limit,
              reset: limitResult.reset,
            },
            { status: 429 }
          );

          // Add rate limit headers
          limitResult.headers.forEach((value: string, key: string) => {
            response.headers.set(key, value);
          });

          // Log the rate limit hit
          await logRequest(req, response, startTime);

          return response;
        }
      }

      // Call the handler
      const response = await handler(req, context);
      
      // Log the request
      await logRequest(req, response, startTime);
      
      return response;
    } catch (error) {
      // Log the error
      const duration = Date.now() - startTime;
      logger.error("API Request Exception", error as Error, {
        method: req.method,
        url: req.nextUrl.pathname,
        duration,
        ip: getClientIp(req),
      });
      
      // Re-throw the error
      throw error;
    }
  };
}
