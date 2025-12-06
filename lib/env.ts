/**
 * Environment Variable Validation
 *
 * Validates all required and optional environment variables at application startup.
 * Fails fast with clear error messages if configuration is incomplete.
 */

import { z } from 'zod';
import { logger } from './logger';

/**
 * Define the schema for environment variables
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL connection string'),

  // Redis (optional for development, required for production)
  REDIS_URL: z.string().url('REDIS_URL must be a valid Redis connection string').optional(),

  // Clerk Authentication (required)
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required'),
  CLERK_SECRET_KEY: z.string().min(1, 'CLERK_SECRET_KEY is required'),
  CLERK_WEBHOOK_SECRET: z.string().min(1, 'CLERK_WEBHOOK_SECRET is required'),

  // Clerk URLs
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().optional().default('/sign-in'),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().optional().default('/sign-up'),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().optional().default('/dashboard'),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().optional().default('/dashboard'),

  // AI Providers (at least one required)
  OPENAI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),

  // Razorpay Payment Gateway (required for subscriptions)
  RAZORPAY_KEY_ID: z.string().min(1, 'RAZORPAY_KEY_ID is required for payment processing'),
  RAZORPAY_KEY_SECRET: z.string().min(1, 'RAZORPAY_KEY_SECRET is required for payment processing'),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().min(1, 'NEXT_PUBLIC_RAZORPAY_KEY_ID is required'),

  // App Configuration
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL').default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Sentry Error Tracking (optional)
  SENTRY_DSN: z.string().url('SENTRY_DSN must be a valid URL').optional(),
});

/**
 * Type for validated environment variables
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Validated environment variables
 * Throws an error during startup if validation fails
 */
let validatedEnv: Env | null = null;

/**
 * Validate environment variables
 * Must be called during application initialization
 */
export function validateEnv(): Env {
  if (validatedEnv) {
    return validatedEnv;
  }

  try {
    const parsed = envSchema.parse(process.env);

    // Additional validation: at least one AI provider configured
    if (!parsed.OPENAI_API_KEY && !parsed.GEMINI_API_KEY) {
      throw new Error('At least one AI provider (OPENAI_API_KEY or GEMINI_API_KEY) must be configured');
    }

    // Warning: Redis required in production
    if (parsed.NODE_ENV === 'production' && !parsed.REDIS_URL) {
      logger.warn('REDIS_URL not configured in production - rate limiting will not work properly');
    }

    // Warning: Sentry recommended in production
    if (parsed.NODE_ENV === 'production' && !parsed.SENTRY_DSN) {
      logger.warn('SENTRY_DSN not configured - error tracking will be disabled');
    }

    validatedEnv = parsed;
    logger.info('Environment variables validated successfully');

    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors
        .map((e) => `  - ${e.path.join('.')}: ${e.message}`)
        .join('\n');

      const message = `Environment variable validation failed:\n${errors}`;
      logger.error(message);
      throw new Error(message);
    }

    throw error;
  }
}

/**
 * Get validated environment variables
 * Must call validateEnv() first
 */
export function getEnv(): Env {
  if (!validatedEnv) {
    return validateEnv();
  }
  return validatedEnv;
}

/**
 * Check if in production
 */
export function isProduction(): boolean {
  return getEnv().NODE_ENV === 'production';
}

/**
 * Check if in development
 */
export function isDevelopment(): boolean {
  return getEnv().NODE_ENV === 'development';
}

/**
 * Check if Redis is available
 */
export function hasRedis(): boolean {
  const env = getEnv();
  return !!env.REDIS_URL;
}

/**
 * Check if Sentry is configured
 */
export function hasSentry(): boolean {
  const env = getEnv();
  return !!env.SENTRY_DSN;
}

/**
 * Check if AI provider is configured
 */
export function hasAIProvider(): boolean {
  const env = getEnv();
  return !!(env.OPENAI_API_KEY || env.GEMINI_API_KEY);
}
