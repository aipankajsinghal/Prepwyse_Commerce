/**
 * Redis-Based Rate Limiting Middleware
 *
 * Production-ready rate limiting using Redis for serverless/distributed environments.
 * Works with both traditional Redis and Upstash Redis.
 *
 * Usage:
 * ```typescript
 * import { withRedisRateLimit, createRedisRateLimiter, aiRateLimit } from '@/lib/middleware/redis-rateLimit';
 *
 * export const POST = withRedisRateLimit(
 *   async (req) => { ... },
 *   aiRateLimit
 * );
 * ```
 */

import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";
import { logger } from "@/lib/logger";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyPrefix?: string; // Optional prefix for Redis keys
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  headers: Headers;
}

/**
 * Get identifier from request (user ID from Clerk or IP address)
 */
function getIdentifier(req: NextRequest): string {
  // Try to get user ID from authorization header (Clerk token)
  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    // Clerk provides user info in the Bearer token
    try {
      const token = authHeader.substring("Bearer ".length);
      if (token && token.length > 0) {
        return `user:${token.substring(0, 50)}`; // Use first 50 chars to avoid key size issues
      }
    } catch {
      // Fallback to IP
    }
  }

  // Fallback to IP address
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "unknown";

  return `ip:${ip}`;
}

/**
 * Create a custom rate limiter with specified configuration
 */
export function createRedisRateLimiter(
  config: RateLimitConfig
): (req: NextRequest) => Promise<RateLimitResult> {
  return async (req: NextRequest): Promise<RateLimitResult> => {
    try {
      const identifier = getIdentifier(req);
      const pathname = req.nextUrl.pathname;
      const keyPrefix = config.keyPrefix || "ratelimit";
      const key = `${keyPrefix}:${pathname}:${identifier}`;

      const now = Date.now();
      const windowStart = now - config.windowMs;

      // Use Redis ZADD to maintain a sorted set of request timestamps
      // This is more efficient than incrementing a counter with TTL

      // Remove old requests outside the window
      await redis.zremrangebyscore(key, "-inf", windowStart);

      // Count requests in the current window
      const requestCount = await redis.zcard(key);

      // Add current request timestamp
      await redis.zadd(key, now, `${now}-${Math.random()}`);

      // Set expiration on the key (add 1 second buffer to prevent race conditions)
      await redis.expire(key, Math.ceil(config.windowMs / 1000) + 1);

      const success = requestCount < config.maxRequests;
      const remaining = Math.max(0, config.maxRequests - requestCount - 1);
      const resetTime = now + config.windowMs;

      const headers = new Headers();
      headers.set("X-RateLimit-Limit", config.maxRequests.toString());
      headers.set("X-RateLimit-Remaining", remaining.toString());
      headers.set("X-RateLimit-Reset", resetTime.toString());

      if (!success) {
        headers.set(
          "Retry-After",
          Math.ceil((resetTime - now) / 1000).toString()
        );
      }

      return {
        success,
        limit: config.maxRequests,
        remaining,
        reset: resetTime,
        headers,
      };
    } catch (error) {
      logger.error("Rate limit check failed:", error);
      // Fail open on Redis errors - allow request but log
      return {
        success: true,
        limit: config.maxRequests,
        remaining: config.maxRequests,
        reset: Date.now() + config.windowMs,
        headers: new Headers(),
      };
    }
  };
}

/**
 * Default rate limiter: 100 requests per 15 minutes
 */
export const defaultRateLimit = createRedisRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  keyPrefix: "rl:default",
});

/**
 * Strict rate limiter for sensitive endpoints: 10 requests per minute
 */
export const strictRateLimit = createRedisRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
  keyPrefix: "rl:strict",
});

/**
 * Loose rate limiter for public endpoints: 300 requests per 15 minutes
 */
export const looseRateLimit = createRedisRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 300,
  keyPrefix: "rl:loose",
});

/**
 * AI endpoint rate limiter: 5 requests per hour (strict to prevent API cost explosion)
 */
export const aiRateLimit = createRedisRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5, // Reduced from 20 to prevent cost explosion
  keyPrefix: "rl:ai",
});

/**
 * Auth endpoint rate limiter: 5 requests per minute
 */
export const authRateLimit = createRedisRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5,
  keyPrefix: "rl:auth",
});

/**
 * Webhook rate limiter: 100 requests per 15 minutes
 */
export const webhookRateLimit = createRedisRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  keyPrefix: "rl:webhook",
});

/**
 * Higher-order function to wrap API routes with rate limiting
 */
export function withRedisRateLimit(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
  limiter: (req: NextRequest) => Promise<RateLimitResult> = defaultRateLimit
): (req: NextRequest, context?: any) => Promise<NextResponse> {
  return async (req: NextRequest, context?: any) => {
    const limitResult = await limiter(req);

    if (!limitResult.success) {
      const response = NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
          limit: limitResult.limit,
          remaining: limitResult.remaining,
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
export async function checkRedisRateLimit(
  req: NextRequest,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  try {
    const identifier = getIdentifier(req);
    const pathname = req.nextUrl.pathname;
    const keyPrefix = config.keyPrefix || "ratelimit";
    const key = `${keyPrefix}:${pathname}:${identifier}`;

    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Count requests in the current window
    const requestCount = await redis.zcount(key, windowStart, "+inf");

    const success = requestCount < config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - requestCount);
    const resetTime = now + config.windowMs;

    const headers = new Headers();
    headers.set("X-RateLimit-Limit", config.maxRequests.toString());
    headers.set("X-RateLimit-Remaining", remaining.toString());
    headers.set("X-RateLimit-Reset", resetTime.toString());

    return {
      success,
      limit: config.maxRequests,
      remaining,
      reset: resetTime,
      headers,
    };
  } catch (error) {
    logger.error("Rate limit check failed:", error);
    // Fail open on Redis errors
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests,
      reset: Date.now() + config.windowMs,
      headers: new Headers(),
    };
  }
}
