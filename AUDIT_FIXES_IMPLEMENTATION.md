# Audit Fixes Implementation Guide

This document provides detailed, step-by-step instructions for implementing fixes identified in the Comprehensive Audit Report.

---

## 🔴 Priority 0: Critical Security Fixes

### Fix 1: XSS Vulnerability in Study Notes

**File**: `app/study-notes/view/[id]/page.tsx`

#### Step 1: Install DOMPurify
```bash
npm install isomorphic-dompurify
npm install --save-dev @types/dompurify
```

#### Step 2: Update the Component
```typescript
// At the top of the file
import DOMPurify from 'isomorphic-dompurify';

// Replace lines 280-285 with:
<div
  className="prose prose-lg dark:prose-invert max-w-none"
  dangerouslySetInnerHTML={{
    __html: DOMPurify.sanitize(
      note.content.replace(/\n/g, "<br>"),
      {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code', 'pre', 'blockquote'],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
      }
    ),
  }}
/>
```

#### Step 3: Test
1. Create a test note with malicious content: `<script>alert('XSS')</script>`
2. View the note - script should be stripped
3. Test valid HTML like `<strong>Bold text</strong>` - should render correctly

#### Verification
```bash
# Run tests
npm test

# Check TypeScript
npx tsc --noEmit

# Test the page manually in browser
npm run dev
```

---

### Fix 2: Add Clerk Authentication Middleware

**File**: Create `middleware.ts` in root directory

#### Step 1: Create Middleware File
```typescript
import { authMiddleware } from "@clerk/nextjs/server";

/**
 * Clerk authentication middleware
 * Protects all routes except public ones by default
 */
export default authMiddleware({
  // Routes that don't require authentication
  publicRoutes: [
    "/",
    "/api/health",
    "/api/subjects",
    "/sign-in(.*)",
    "/sign-up(.*)",
  ],
  
  // Routes that should be completely ignored by Clerk
  ignoredRoutes: [
    "/api/webhooks(.*)",
    "/_next(.*)",
    "/favicon.ico",
    "/robots.txt",
    "/sitemap.xml",
  ],
  
  // Allow API routes to be accessed without session for specific endpoints
  publicApiRoutes: [
    "/api/health",
  ],
});

export const config = {
  matcher: [
    // Match all routes except static files and images
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
```

#### Step 2: Test Authentication
1. Try accessing `/dashboard` without login → should redirect to `/sign-in`
2. Try accessing `/api/quiz` without auth → should return 401
3. Access `/api/health` → should work without auth
4. Login and access protected routes → should work

#### Verification
```bash
# Run the app
npm run dev

# Test protected routes
curl http://localhost:3000/api/quiz
# Should return 401 Unauthorized

curl http://localhost:3000/api/health
# Should return 200 with health status
```

---

## 🟡 Priority 1: High Priority Security & Performance

### Fix 3: Apply Rate Limiting to All API Routes

#### Step 3A: AI Endpoints (Highest Priority)

**Files to update**:
- `app/api/ai/generate-quiz/route.ts`
- `app/api/ai/explain/route.ts`
- `app/api/ai/recommendations/route.ts`
- `app/api/ai/content-suggestions/route.ts`
- `app/api/question-generation/generate/route.ts`

**Pattern to apply**:
```typescript
import { NextRequest } from "next/server";
import { withRateLimit, aiRateLimit } from "@/lib/middleware/rateLimit";
import { handleApiError, unauthorizedError } from "@/lib/api-error-handler";

// Wrap the entire route handler
export const POST = withRateLimit(
  async (request: NextRequest) => {
    // existing handler code stays the same
    try {
      const { userId } = await auth();
      if (!userId) {
        return unauthorizedError();
      }
      // ... rest of existing code
    } catch (error) {
      return handleApiError(error, "Failed to ...");
    }
  },
  aiRateLimit // 20 requests per hour
);
```

#### Step 3B: Payment Endpoints

**Files to update**:
- `app/api/subscription/create-order/route.ts`
- `app/api/subscription/verify/route.ts`
- `app/api/subscription/cancel/route.ts`

**Pattern**:
```typescript
import { withRateLimit, strictRateLimit } from "@/lib/middleware/rateLimit";

export const POST = withRateLimit(
  async (request: NextRequest) => {
    // existing handler code
  },
  strictRateLimit // 10 requests per minute
);
```

#### Step 3C: Authentication Endpoints

**Files to update**:
- `app/api/user/sync/route.ts`
- `app/api/user/delete/route.ts`

**Pattern**:
```typescript
import { withRateLimit, authRateLimit } from "@/lib/middleware/rateLimit";

export const POST = withRateLimit(
  async () => {
    // existing handler code
  },
  authRateLimit // 5 requests per minute
);
```

#### Step 3D: General API Endpoints

**Files to update**: All other routes in `app/api/*`

**Pattern**:
```typescript
import { withRateLimit, rateLimit } from "@/lib/middleware/rateLimit";

export const POST = withRateLimit(
  async (request: NextRequest) => {
    // existing handler code
  },
  rateLimit // 100 requests per 15 minutes (default)
);

export const GET = withRateLimit(
  async (request: NextRequest) => {
    // existing handler code
  },
  rateLimit
);
```

#### Testing Rate Limits
```bash
# Install testing tool
npm install --save-dev @jest/globals node-fetch

# Create test file: __tests__/rate-limit-integration.test.ts
import { describe, it, expect } from '@jest/globals';

describe('Rate Limiting', () => {
  it('should rate limit AI endpoints', async () => {
    // Make 21 requests rapidly
    for (let i = 0; i < 21; i++) {
      const response = await fetch('http://localhost:3000/api/ai/generate-quiz', {
        method: 'POST',
        // ... with valid auth and body
      });
      
      if (i < 20) {
        expect(response.status).not.toBe(429);
      } else {
        expect(response.status).toBe(429);
        const data = await response.json();
        expect(data.error).toContain('Too many requests');
      }
    }
  });
});
```

---

### Fix 4: Add Input Validation to All Routes

#### Step 4A: Create Validation Wrapper Utility

**File**: `lib/utils/validateRequest.ts`
```typescript
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { validationError } from '@/lib/api-error-handler';

export async function validateRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<T | NextResponse> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);
    
    if (!result.success) {
      const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      return validationError(errors.join(', '));
    }
    
    return result.data;
  } catch (error) {
    return validationError('Invalid JSON in request body');
  }
}
```

#### Step 4B: Apply to Routes

**Example**: `app/api/quiz/route.ts`

```typescript
import { validateRequestBody } from '@/lib/utils/validateRequest';
import { createQuizSchema } from '@/lib/validations/schemas';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return unauthorizedError();
    }

    // Validate input
    const validated = await validateRequestBody(request, createQuizSchema);
    if (validated instanceof NextResponse) {
      return validated; // Validation error response
    }
    
    const { title, description, subjectId, chapterIds, questionCount, duration } = validated;
    
    // Rest of the handler with validated data
    // ...
  } catch (error) {
    return handleApiError(error, "Failed to create quiz");
  }
}
```

#### Step 4C: Priority Routes for Validation

Apply validation in this order:
1. **Admin routes** - Subscription plans, study notes, practice papers
2. **AI routes** - Generate quiz, recommendations
3. **User data routes** - Profile updates, preferences
4. **Quiz/Test routes** - Create quiz, submit answers
5. **Remaining routes** - Search, gamification, etc.

---

### Fix 5: Fix Database Query Logging

**File**: `lib/prisma.ts`

#### Current Code (Lines 7-9)
```typescript
new PrismaClient({
  log: ["query"],
});
```

#### Updated Code
```typescript
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" 
      ? ["query", "error", "warn"] 
      : ["error"], // Only log errors in production
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

#### Verification
```bash
# Development - should see queries
NODE_ENV=development npm run dev
# Check logs for SQL queries

# Production build - should only see errors
npm run build
npm start
# Check logs - no queries logged
```

---

### Fix 6: Centralize Razorpay Key Access

**Files to update**:
- `app/subscription/page.tsx` (client component)
- Any other places using `process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID`

#### Step 1: Create Client-Side Hook

**File**: `lib/hooks/useRazorpay.ts`
```typescript
'use client';

import { useEffect, useState } from 'react';

export function useRazorpay() {
  const [keyId, setKeyId] = useState<string | null>(null);
  
  useEffect(() => {
    // Fetch from environment or API
    setKeyId(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || null);
  }, []);
  
  return { keyId };
}
```

#### Step 2: Update Components

**File**: `app/subscription/page.tsx`
```typescript
import { useRazorpay } from '@/lib/hooks/useRazorpay';

export default function SubscriptionPage() {
  const { keyId } = useRazorpay();
  
  const handlePayment = () => {
    if (!keyId) {
      alert('Payment system not configured');
      return;
    }
    
    const options = {
      key: keyId,
      // ... other options
    };
    // ... payment logic
  };
}
```

---

## 🟢 Priority 2: Medium Priority Improvements

### Fix 7: Add Security Headers

**File**: `next.config.js`

#### Update Headers Configuration
```javascript
const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  compress: true,
  
  // Enhanced security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // DNS prefetch
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          // Prevent MIME sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // XSS protection
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Referrer policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com https://challenges.cloudflare.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.openai.com https://generativelanguage.googleapis.com https://api.razorpay.com https://clerk.com https://*.clerk.accounts.dev",
              "frame-src https://checkout.razorpay.com https://challenges.cloudflare.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
```

#### Testing
```bash
# Build and start
npm run build
npm start

# Test headers
curl -I http://localhost:3000
# Should see all security headers in response
```

---

### Fix 8: Add CORS Configuration

**File**: `next.config.js` (add to headers)

```javascript
async headers() {
  return [
    // Existing headers...
    
    // CORS headers for API routes
    {
      source: '/api/:path*',
      headers: [
        {
          key: 'Access-Control-Allow-Origin',
          value: process.env.ALLOWED_ORIGINS || 'https://prepwyse.com',
        },
        {
          key: 'Access-Control-Allow-Methods',
          value: 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        },
        {
          key: 'Access-Control-Allow-Headers',
          value: 'Content-Type, Authorization, X-Requested-With',
        },
        {
          key: 'Access-Control-Max-Age',
          value: '86400', // 24 hours
        },
      ],
    },
  ];
},
```

**Add to `.env.example`**:
```env
# CORS Configuration
ALLOWED_ORIGINS=https://prepwyse.com,https://www.prepwyse.com
```

---

### Fix 9: Remove Console.log Statements

#### Step 1: Update Logger Usage

**Files with console.log**:
1. `app/referral/page.tsx`
2. `components/PWAInstallPrompt.tsx`
3. `components/ServiceWorkerRegistration.tsx`
4. `lib/ai-provider.ts`
5. `lib/offline-storage.ts`

#### Pattern to Follow
```typescript
// Before
console.log("User data:", userData);
console.error("Error:", error);

// After
import { logger } from '@/lib/logger';

logger.info("User data", { userData });
logger.error("Error occurred", error);
```

#### Step 2: Update Logger for Production

**File**: `lib/logger.ts`

Ensure console statements are wrapped:
```typescript
private log(level: string, message: string, data?: any) {
  if (this.isDevelopment) {
    console.log(`[${level}] ${message}`, data);
  }
  // Always log to your logging service (e.g., Sentry, LogRocket)
}
```

---

### Fix 10: Add Request Timeouts

#### Step 1: Create Timeout Utility

**File**: `lib/utils/timeout.ts`
```typescript
/**
 * Wraps a promise with a timeout
 * @param promise - The promise to wrap
 * @param timeoutMs - Timeout in milliseconds
 * @param errorMessage - Custom error message
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
 * Timeout specifically for AI requests (longer timeout)
 */
export async function withAITimeout<T>(promise: Promise<T>): Promise<T> {
  return withTimeout(promise, 60000, 'AI request timeout - please try again');
}

/**
 * Timeout for database operations
 */
export async function withDBTimeout<T>(promise: Promise<T>): Promise<T> {
  return withTimeout(promise, 10000, 'Database operation timeout');
}
```

#### Step 2: Apply to Long-Running Operations

**Example**: `app/api/ai/generate-quiz/route.ts`
```typescript
import { withAITimeout } from '@/lib/utils/timeout';

export async function POST(request: Request) {
  try {
    // ... auth and validation
    
    // Wrap AI call with timeout
    const aiQuestions = await withAITimeout(
      generateAIQuestions({
        subjectName: subject.name,
        chapterNames: subject.chapters.map(c => c.name),
        questionCount,
        difficulty,
        userId: dbUser.id,
      })
    );
    
    // ... rest of handler
  } catch (error) {
    if (error instanceof Error && error.message.includes('timeout')) {
      return NextResponse.json(
        { error: 'Request took too long. Please try with fewer questions.' },
        { status: 504 }
      );
    }
    return handleApiError(error, "Failed to generate AI quiz");
  }
}
```

---

## 🔧 Testing Checklist

After implementing fixes:

### Security Testing
- [ ] XSS prevention: Try injecting `<script>alert('XSS')</script>` in study notes
- [ ] Authentication: Access protected routes without login
- [ ] Rate limiting: Make rapid requests to AI endpoints
- [ ] Input validation: Send malformed JSON to API routes
- [ ] SQL injection: Try SQL in query parameters (should be protected by Prisma)

### Functional Testing
- [ ] User registration and login
- [ ] Quiz creation and taking
- [ ] AI question generation
- [ ] Payment flow (use Razorpay test mode)
- [ ] Admin features (if you have admin access)
- [ ] Search functionality
- [ ] Study notes viewing

### Performance Testing
- [ ] Page load times (should be < 3s)
- [ ] API response times (should be < 500ms for most endpoints)
- [ ] Database query performance
- [ ] Large quiz handling (50+ questions)

### Automated Testing
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Build test
npm run build
```

---

## 📊 Validation Metrics

### Before vs After

| Metric | Before | After Target | Validation |
|--------|--------|--------------|------------|
| Security Score | B (85/100) | A (95/100) | Manual audit |
| XSS Vulnerabilities | 1 | 0 | Code review |
| Unprotected Routes | 40+ | 0 | Auth test |
| Rate Limited Routes | 0% | 100% | Load test |
| Input Validated Routes | 30% | 100% | Code review |
| Console.log Warnings | 29 | 0 | ESLint |
| Security Headers | 2 | 8 | curl -I |
| Average API Response | N/A | < 500ms | Benchmark |

---

## 🚀 Deployment Checklist

Before deploying fixes to production:

### Pre-Deployment
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Build succeeds
- [ ] Local testing complete
- [ ] Security headers verified
- [ ] Rate limiting tested
- [ ] Environment variables set

### Production Deploy
- [ ] Update `.env` with production values
- [ ] Set `NODE_ENV=production`
- [ ] Build with `npm run build`
- [ ] Test build with `npm start`
- [ ] Monitor logs for errors
- [ ] Test critical user flows
- [ ] Monitor error rates
- [ ] Check rate limit headers

### Post-Deployment Monitoring
- [ ] Check error logs (first hour)
- [ ] Monitor API response times
- [ ] Verify rate limiting works
- [ ] Check authentication flows
- [ ] Monitor database connections
- [ ] Verify payment flows (test mode)
- [ ] Review security headers
- [ ] Test XSS prevention

---

## 📝 Additional Notes

### Redis Setup (Future Enhancement)

For production-grade rate limiting:

```bash
# Install Upstash Redis
npm install @upstash/redis @upstash/ratelimit

# Add to .env
UPSTASH_REDIS_REST_URL=your_url
UPSTASH_REDIS_REST_TOKEN=your_token
```

**File**: `lib/middleware/rateLimit-redis.ts`
```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const aiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 h"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});
```

### Monitoring Setup (Recommended)

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

---

## 🆘 Troubleshooting

### Issue: Rate Limiting Not Working
**Solution**: Check that `withRateLimit` is the outermost wrapper:
```typescript
// Correct order
export const POST = withRateLimit(
  withAdminAuth(
    async (req) => { /* handler */ }
  )
);
```

### Issue: Validation Errors Not Helpful
**Solution**: Use `formatValidationErrors` helper:
```typescript
import { formatValidationErrors } from '@/lib/validations/schemas';

if (!result.success) {
  const formatted = formatValidationErrors(result.error);
  return NextResponse.json({ errors: formatted }, { status: 400 });
}
```

### Issue: Timeouts Too Aggressive
**Solution**: Adjust timeout values per endpoint:
```typescript
// For complex operations
await withTimeout(operation(), 120000); // 2 minutes
```

---

**Document Version**: 1.0  
**Last Updated**: November 21, 2024  
**Next Review**: After implementation completion
