/**
 * Request Validation Utilities
 * 
 * Provides helper functions for validating API request payloads using Zod schemas.
 * Ensures type-safe validation and consistent error responses.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { validationError } from '@/lib/api-error-handler';

/**
 * Validates request body against a Zod schema
 * Returns validated data or error response
 * 
 * @param request - The incoming request
 * @param schema - Zod schema to validate against
 * @returns Validated data or NextResponse with validation error
 * 
 * @example
 * ```typescript
 * import { validateRequestBody } from '@/lib/utils/validateRequest';
 * import { createQuizSchema } from '@/lib/validations/schemas';
 * 
 * export async function POST(request: Request) {
 *   const validated = await validateRequestBody(request, createQuizSchema);
 *   if (validated instanceof NextResponse) {
 *     return validated; // Validation error
 *   }
 *   
 *   const { title, description } = validated; // Type-safe validated data
 *   // ... continue with handler
 * }
 * ```
 */
export async function validateRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<T | NextResponse> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);
    
    if (!result.success) {
      // Format validation errors into readable message
      const errors = result.error.issues.map((e: any) => 
        `${e.path.join('.')}: ${e.message}`
      ).join(', ');
      
      return validationError(errors);
    }
    
    return result.data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return validationError('Invalid JSON in request body');
    }
    return validationError('Failed to parse request body');
  }
}

/**
 * Validates query parameters against a Zod schema
 * 
 * @param searchParams - URL search params
 * @param schema - Zod schema to validate against
 * @returns Validated data or NextResponse with validation error
 * 
 * @example
 * ```typescript
 * export async function GET(request: Request) {
 *   const { searchParams } = new URL(request.url);
 *   const validated = validateQueryParams(searchParams, searchSchema);
 *   if (validated instanceof NextResponse) {
 *     return validated;
 *   }
 *   // ... use validated query params
 * }
 * ```
 */
export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): T | NextResponse {
  const params: Record<string, any> = {};
  
  // Convert URLSearchParams to plain object
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  const result = schema.safeParse(params);
  
  if (!result.success) {
    const errors = result.error.issues.map((e: any) => 
      `${e.path.join('.')}: ${e.message}`
    ).join(', ');
    
    return validationError(errors);
  }
  
  return result.data;
}

/**
 * Type guard to check if value is a validation error response
 */
export function isValidationError(value: any): value is NextResponse {
  return value instanceof NextResponse;
}
