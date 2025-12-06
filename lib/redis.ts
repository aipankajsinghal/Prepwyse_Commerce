/**
 * Redis Client Singleton
 *
 * Provides a singleton instance of Redis client for the application.
 * Works with both traditional Redis and Upstash Redis (serverless-friendly).
 */

import Redis from "ioredis";
import { logger } from "./logger";

const globalForRedis = global as unknown as { redis: Redis | null };

export const redis =
  globalForRedis.redis ||
  new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

redis.on("error", (err) => {
  logger.error("Redis connection error:", err);
});

redis.on("connect", () => {
  logger.info("Redis connected successfully");
});

redis.on("ready", () => {
  logger.info("Redis client ready");
});

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

export default redis;
