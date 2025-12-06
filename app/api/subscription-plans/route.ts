/**
 * Public API: Get Active Subscription Plans
 *
 * Endpoint:
 * - GET: Retrieve all active subscription plans (public endpoint)
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/api-error-handler';
import { withRedisRateLimit, looseRateLimit } from '@/lib/middleware/redis-rateLimit';

/**
 * GET /api/subscription-plans
 * Retrieve all active subscription plans for display
 * This is a public endpoint - no authentication required
 */
async function handler(request: Request) {
  try {
    // Fetch active subscription plans sorted by display order
    const plans = await prisma.subscriptionPlan.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        displayName: true,
        description: true,
        price: true,
        durationDays: true,
        features: true,
        order: true,
      },
      orderBy: {
        order: 'asc',
      },
    });

    // Convert Decimal to string for JSON serialization
    const serializedPlans = plans.map((plan) => ({
      ...plan,
      price: plan.price.toString(),
    }));

    return NextResponse.json({
      plans: serializedPlans,
      count: serializedPlans.length,
    });
  } catch (error) {
    return handleApiError(error, 'Failed to fetch subscription plans');
  }
}

// Apply loose rate limiting: 300 requests per 15 minutes (public endpoint)
export const GET = withRedisRateLimit(handler, looseRateLimit);
