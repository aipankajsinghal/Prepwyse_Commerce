/**
 * API Rate Limiting Middleware
 * 
 * Simple in-memory rate limiting for API routes.
 * For production, consider using Redis-based solution like Upstash Rate Limit.
 * 
 * Usage:
 * ```typescript
 * import { rateLimit, createRateLimiter } from '@/lib/middleware/rateLimit';
 * 
 * export async function POST(req: NextRequest) {
 *   const limitResult = await rateLimit(req);
 *   if (!limitResult.success) {
 *     return NextResponse.json(
 *       { error: 'Too many requests' },
 *       { status: 429, headers: limitResult.headers }
 *     );
 *   }
 *   
 *   // Continue with request handling
 * }
 * ```
 */

import { NextRequest, NextResponse } from "next/server";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store for rate limit tracking
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Prune expired entries from the store
 * Called lazily to avoid setInterval in serverless environments
 */
function pruneStore() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Get identifier from request (IP address or user ID)
 */
function getIdentifier(req: NextRequest): string {
  // Try to get user ID from auth header if available
  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    const userId = authHeader.split(" ")[1]; // Assuming "Bearer <userId>"
    if (userId) return `user:${userId}`;
  }

  // Fallback to IP address
  const ip = req.headers.get("x-forwarded-for") || 
             req.headers.get("x-real-ip") || 
             "unknown";
  
  return `ip:${ip}`;
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  headers: Headers;
}

/**
 * Apply rate limiting to a request
 */
export function createRateLimiter(config: RateLimitConfig) {
  return async (req: NextRequest): Promise<RateLimitResult> => {
    // Lazy cleanup of expired entries (approx every 100 requests to avoid perf hit)
    if (Math.random() < 0.01) {
      pruneStore();
    }

    const identifier = getIdentifier(req);
    const key = `${req.nextUrl.pathname}:${identifier}`;
    const now = Date.now();

    let entry = rateLimitStore.get(key);

    // Initialize or reset if window expired
    if (!entry || entry.resetAt < now) {
      entry = {
        count: 0,
        resetAt: now + config.windowMs,
      };
      rateLimitStore.set(key, entry);
    }

    // Increment request count
    entry.count++;

    // Check if limit exceeded
    const success = entry.count <= config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - entry.count);

    // Create rate limit headers
    const headers = new Headers();
    headers.set("X-RateLimit-Limit", config.maxRequests.toString());
    headers.set("X-RateLimit-Remaining", remaining.toString());
    headers.set("X-RateLimit-Reset", entry.resetAt.toString());

    if (!success) {
      headers.set("Retry-After", Math.ceil((entry.resetAt - now) / 1000).toString());
    }

    return {
      success,
      limit: config.maxRequests,
      remaining,
      reset: entry.resetAt,
      headers,
    };
  };
}

/**
 * Default rate limiter: 100 requests per 15 minutes
 */
export const rateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
});

/**
 * Strict rate limiter for sensitive endpoints: 10 requests per minute
 */
export const strictRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
});

/**
 * Loose rate limiter for public endpoints: 300 requests per 15 minutes
 */
export const looseRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 300,
});

/**
 * AI endpoint rate limiter: 20 requests per hour
 */
export const aiRateLimit = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 20,
});

/**
 * Auth endpoint rate limiter: 5 requests per minute
 */
export const authRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5,
});

/**
 * Higher-order function to wrap API routes with rate limiting
 */
export function withRateLimit(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
  limiter: (req: NextRequest) => Promise<RateLimitResult> = rateLimit
): (req: NextRequest, context?: any) => Promise<NextResponse> {
  return async (req: NextRequest, context?: any) => {
    const limitResult = await limiter(req);

    if (!limitResult.success) {
      const response = NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
          limit: limitResult.limit,
          reset: limitResult.reset,
        },
        { status: 429 }
      );

      // Add rate limit headers to response
      limitResult.headers.forEach((value, key) => {
        response.headers.set(key, value);
      });

      return response;
    }

    // Call the handler and add rate limit headers to successful response
    const response = await handler(req, context);
    limitResult.headers.forEach((value, key) => {
      response.headers.set(key, value);
    });

    return response;
  };
}

/**
 * Check if request is rate limited without incrementing counter
 */
export async function checkRateLimit(
  req: NextRequest,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const identifier = getIdentifier(req);
  const key = `${req.nextUrl.pathname}:${identifier}`;
  const now = Date.now();

  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt < now) {
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests,
      reset: now + config.windowMs,
      headers: new Headers(),
    };
  }

  const remaining = Math.max(0, config.maxRequests - entry.count);
  const headers = new Headers();
  headers.set("X-RateLimit-Limit", config.maxRequests.toString());
  headers.set("X-RateLimit-Remaining", remaining.toString());
  headers.set("X-RateLimit-Reset", entry.resetAt.toString());

  return {
    success: entry.count < config.maxRequests,
    limit: config.maxRequests,
    remaining,
    reset: entry.resetAt,
    headers,
  };
}
