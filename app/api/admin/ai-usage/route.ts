/**
 * Admin API: AI Usage Monitoring and Statistics
 *
 * Endpoints:
 * - GET: Fetch AI API usage statistics and alerts
 * - POST: Update alert thresholds
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getUsageStats,
  getDailyCostBreakdown,
  getEndpointUsageBreakdown,
  getRemainingBudget,
  isWithinBudget,
  ALERT_THRESHOLDS,
} from '@/lib/ai-usage-monitor';
import { handleApiError, unauthorizedError, forbiddenError } from '@/lib/api-error-handler';
import { withRedisRateLimit, strictRateLimit } from '@/lib/middleware/redis-rateLimit';

/**
 * GET /api/admin/ai-usage
 * Fetch AI usage statistics and alerts
 */
async function handler(req: NextRequest): Promise<NextResponse> {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return unauthorizedError();
    }

    // Verify admin role
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user || user.role !== 'ADMIN') {
      return forbiddenError('Only admins can view API usage statistics');
    }

    const { searchParams } = new URL(req.url);
    const provider = searchParams.get('provider') || 'openai';
    const timeRange = searchParams.get('timeRange') || 'all'; // all, today, week, month

    // Calculate date range
    let startDate, endDate;
    const now = new Date();

    switch (timeRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = now;
        break;
      default:
        startDate = undefined;
        endDate = undefined;
    }

    // Get statistics
    const stats = await getUsageStats({
      provider,
      startDate,
      endDate,
    });

    // Get daily breakdown
    const dailyBreakdown = await getDailyCostBreakdown(provider);

    // Get endpoint breakdown
    const endpointBreakdown = await getEndpointUsageBreakdown(provider);

    // Get alerts
    const alerts = await prisma.aPIUsageAlert.findMany({
      where: { provider, isTriggered: true },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });

    // Get budget info
    const remainingBudget = await getRemainingBudget(provider);
    const withinBudget = await isWithinBudget(provider);

    return NextResponse.json({
      statistics: stats,
      dailyBreakdown,
      endpointBreakdown,
      alerts,
      budget: {
        monthlyLimit: ALERT_THRESHOLDS.monthlyBudget,
        remaining: remainingBudget,
        withinBudget,
      },
      thresholds: ALERT_THRESHOLDS,
    });
  } catch (error) {
    return handleApiError(error, 'Failed to fetch AI usage statistics');
  }
}

/**
 * POST /api/admin/ai-usage
 * Update alert thresholds (if needed)
 */
async function postHandler(req: NextRequest): Promise<NextResponse> {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return unauthorizedError();
    }

    // Verify admin role
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user || user.role !== 'ADMIN') {
      return forbiddenError('Only admins can update alert thresholds');
    }

    const body = await req.json();
    const { provider, alertType, threshold } = body;

    if (!provider || !alertType || threshold === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: provider, alertType, threshold' },
        { status: 400 }
      );
    }

    // Update or create alert threshold
    const alert = await prisma.aPIUsageAlert.upsert({
      where: {
        id: `${provider}-${alertType}-threshold`,
      },
      create: {
        provider,
        alertType,
        threshold,
        currentValue: 0,
      },
      update: {
        threshold,
      },
    });

    return NextResponse.json({
      message: 'Alert threshold updated successfully',
      alert,
    });
  } catch (error) {
    return handleApiError(error, 'Failed to update alert threshold');
  }
}

export const GET = withRedisRateLimit(handler, strictRateLimit);
export const POST = withRedisRateLimit(postHandler, strictRateLimit);
