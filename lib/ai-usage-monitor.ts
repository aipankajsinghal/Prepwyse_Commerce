/**
 * AI API Usage Monitoring and Cost Tracking
 *
 * Tracks OpenAI API usage, calculates costs, and triggers alerts
 * when usage exceeds configured thresholds.
 */

import { prisma } from './prisma';
import Sentry from './Sentry';

// Token pricing (as of 2024) - update as prices change
const PRICING = {
  openai: {
    'gpt-4': {
      promptTokenPrice: 0.000030,      // $0.03 per 1K tokens
      completionTokenPrice: 0.000060,  // $0.06 per 1K tokens
    },
    'gpt-4-turbo': {
      promptTokenPrice: 0.000010,      // $0.01 per 1K tokens
      completionTokenPrice: 0.000030,  // $0.03 per 1K tokens
    },
    'gpt-3.5-turbo': {
      promptTokenPrice: 0.0000005,     // $0.0005 per 1K tokens
      completionTokenPrice: 0.0000015, // $0.0015 per 1K tokens
    },
  },
  gemini: {
    'gemini-pro': {
      promptTokenPrice: 0.0000005,     // $0.0005 per 1K tokens
      completionTokenPrice: 0.0000015, // $0.0015 per 1K tokens
    },
  },
};

// Alert thresholds (can be customized via environment variables)
export const ALERT_THRESHOLDS = {
  dailyCostLimit: parseFloat(process.env.API_USAGE_DAILY_LIMIT || '10'), // $10/day
  hourlyCostLimit: parseFloat(process.env.API_USAGE_HOURLY_LIMIT || '2'), // $2/hour
  monthlyBudget: parseFloat(process.env.API_USAGE_MONTHLY_BUDGET || '300'), // $300/month
  callsPerDay: parseInt(process.env.API_USAGE_CALLS_PER_DAY || '1000', 10), // 1000 calls/day
};

interface APIUsageRecord {
  provider: string;
  model: string;
  userId?: string | null;
  endpoint: string;
  promptTokens: number;
  completionTokens: number;
  responseLength: number;
  duration: number;
  success?: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

/**
 * Calculate cost for API call based on tokens used
 */
export function calculateCost(
  provider: string,
  model: string,
  promptTokens: number,
  completionTokens: number
): number {
  const providerPricing = PRICING[provider as keyof typeof PRICING];
  if (!providerPricing) {
    console.warn(`Unknown provider: ${provider}`);
    return 0;
  }

  const modelPricing = providerPricing[model as keyof typeof providerPricing];
  if (!modelPricing) {
    console.warn(`Unknown model: ${model}`);
    return 0;
  }

  const promptCost = promptTokens * modelPricing.promptTokenPrice;
  const completionCost = completionTokens * modelPricing.completionTokenPrice;

  return parseFloat((promptCost + completionCost).toFixed(6));
}

/**
 * Record API usage to database
 */
export async function recordAPIUsage(record: APIUsageRecord) {
  try {
    const totalTokens = record.promptTokens + record.completionTokens;
    const estimatedCost = calculateCost(
      record.provider,
      record.model,
      record.promptTokens,
      record.completionTokens
    );

    const usage = await prisma.aPIUsage.create({
      data: {
        provider: record.provider,
        model: record.model,
        userId: record.userId,
        endpoint: record.endpoint,
        promptTokens: record.promptTokens,
        completionTokens: record.completionTokens,
        totalTokens,
        estimatedCost,
        responseLength: record.responseLength,
        duration: record.duration,
        success: record.success ?? true,
        errorMessage: record.errorMessage,
        metadata: record.metadata,
      },
    });

    // Check for alerts
    await checkUsageAlerts(record.provider, estimatedCost);

    return usage;
  } catch (error) {
    console.error('Error recording API usage:', error);
    Sentry.captureException(error, {
      tags: { component: 'api-usage-monitor', action: 'recordAPIUsage' },
    });
    // Don't throw - usage tracking should not break the application
    return null;
  }
}

/**
 * Check if any usage alerts need to be triggered
 */
async function checkUsageAlerts(provider: string, costOfCurrentCall: number) {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Check hourly limit
    const hourlyUsage = await prisma.aPIUsage.aggregate({
      where: {
        provider,
        createdAt: { gte: oneHourAgo },
        success: true,
      },
      _sum: { estimatedCost: true },
    });

    const hourlyCost = (hourlyUsage._sum.estimatedCost?.toNumber() || 0) + costOfCurrentCall;
    if (hourlyCost > ALERT_THRESHOLDS.hourlyCostLimit) {
      await triggerAlert(provider, 'hourly_cost', ALERT_THRESHOLDS.hourlyCostLimit, hourlyCost);
    }

    // Check daily limit
    const dailyUsage = await prisma.aPIUsage.aggregate({
      where: {
        provider,
        createdAt: { gte: todayStart },
        success: true,
      },
      _sum: { estimatedCost: true },
      _count: { id: true },
    });

    const dailyCost = (dailyUsage._sum.estimatedCost?.toNumber() || 0) + costOfCurrentCall;
    if (dailyCost > ALERT_THRESHOLDS.dailyCostLimit) {
      await triggerAlert(provider, 'daily_cost', ALERT_THRESHOLDS.dailyCostLimit, dailyCost);
    }

    // Check daily call limit
    const dailyCallCount = (dailyUsage._count.id || 0) + 1;
    if (dailyCallCount > ALERT_THRESHOLDS.callsPerDay) {
      await triggerAlert(provider, 'daily_calls', ALERT_THRESHOLDS.callsPerDay, dailyCallCount);
    }

    // Check monthly budget
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyUsage = await prisma.aPIUsage.aggregate({
      where: {
        provider,
        createdAt: { gte: monthStart },
        success: true,
      },
      _sum: { estimatedCost: true },
    });

    const monthlyCost = (monthlyUsage._sum.estimatedCost?.toNumber() || 0) + costOfCurrentCall;
    if (monthlyCost > ALERT_THRESHOLDS.monthlyBudget) {
      await triggerAlert(provider, 'monthly_budget', ALERT_THRESHOLDS.monthlyBudget, monthlyCost);
    }
  } catch (error) {
    console.error('Error checking usage alerts:', error);
    // Don't throw - we don't want alert checking to break the application
  }
}

/**
 * Trigger an alert when usage exceeds threshold
 */
async function triggerAlert(
  provider: string,
  alertType: string,
  threshold: number,
  currentValue: number
) {
  try {
    const message = formatAlertMessage(alertType, threshold, currentValue);

    // Create or update alert
    const alert = await prisma.aPIUsageAlert.upsert({
      where: {
        // Use composite unique identifier
        id: `${provider}-${alertType}-${new Date().toISOString().split('T')[0]}`,
      },
      create: {
        provider,
        alertType,
        threshold: threshold,
        currentValue: currentValue,
        isTriggered: true,
        notificationSent: false,
        message,
      },
      update: {
        currentValue: currentValue,
        isTriggered: true,
        message,
        updatedAt: new Date(),
      },
    });

    // Log to Sentry for visibility
    Sentry.captureMessage(message, 'warning', {
      tags: { component: 'api-usage-monitor', alertType, provider },
    });

    console.warn(`API Usage Alert: ${message}`);

    return alert;
  } catch (error) {
    console.error('Error triggering alert:', error);
    // Don't throw
  }
}

/**
 * Format alert message
 */
function formatAlertMessage(alertType: string, threshold: number, currentValue: number): string {
  const percentOverBudget = ((currentValue - threshold) / threshold * 100).toFixed(1);

  switch (alertType) {
    case 'hourly_cost':
      return `Hourly API cost (${currentValue.toFixed(2)}) exceeded limit of $${threshold.toFixed(2)} (+${percentOverBudget}%)`;
    case 'daily_cost':
      return `Daily API cost ($${currentValue.toFixed(2)}) exceeded limit of $${threshold.toFixed(2)} (+${percentOverBudget}%)`;
    case 'daily_calls':
      return `Daily API calls (${Math.round(currentValue)}) exceeded limit of ${Math.round(threshold)} (+${percentOverBudget}%)`;
    case 'monthly_budget':
      return `Monthly API budget ($${currentValue.toFixed(2)}) exceeded limit of $${threshold.toFixed(2)} (+${percentOverBudget}%)`;
    default:
      return `API usage alert: ${alertType}`;
  }
}

/**
 * Get usage statistics for a date range
 */
export async function getUsageStats(options?: {
  provider?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  endpoint?: string;
}) {
  try {
    const where: any = {};
    if (options?.provider) where.provider = options.provider;
    if (options?.userId) where.userId = options.userId;
    if (options?.endpoint) where.endpoint = options.endpoint;
    if (options?.startDate || options?.endDate) {
      where.createdAt = {};
      if (options.startDate) where.createdAt.gte = options.startDate;
      if (options.endDate) where.createdAt.lte = options.endDate;
    }

    const stats = await prisma.aPIUsage.aggregate({
      where: { ...where, success: true },
      _sum: {
        promptTokens: true,
        completionTokens: true,
        totalTokens: true,
        estimatedCost: true,
        duration: true,
      },
      _count: { id: true },
      _avg: {
        duration: true,
      },
    });

    const failedCount = await prisma.aPIUsage.count({
      where: { ...where, success: false },
    });

    return {
      totalCalls: stats._count.id || 0,
      successfulCalls: stats._count.id || 0,
      failedCalls: failedCount,
      totalTokens: stats._sum.totalTokens || 0,
      promptTokens: stats._sum.promptTokens || 0,
      completionTokens: stats._sum.completionTokens || 0,
      totalCost: (stats._sum.estimatedCost?.toNumber() || 0).toFixed(6),
      averageDuration: Math.round(stats._avg.duration || 0),
      totalDuration: stats._sum.duration || 0,
    };
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    Sentry.captureException(error, {
      tags: { component: 'api-usage-monitor', action: 'getUsageStats' },
    });
    throw error;
  }
}

/**
 * Get daily cost breakdown
 */
export async function getDailyCostBreakdown(provider?: string) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyData = await prisma.aPIUsage.groupBy({
      by: ['createdAt'],
      where: {
        ...(provider && { provider }),
        success: true,
        createdAt: { gte: thirtyDaysAgo },
      },
      _sum: {
        estimatedCost: true,
      },
      _count: {
        id: true,
      },
    });

    return dailyData
      .map((day) => ({
        date: new Date(day.createdAt).toISOString().split('T')[0],
        cost: (day._sum.estimatedCost?.toNumber() || 0).toFixed(6),
        calls: day._count.id || 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Error fetching daily cost breakdown:', error);
    return [];
  }
}

/**
 * Get endpoint usage breakdown
 */
export async function getEndpointUsageBreakdown(provider?: string) {
  try {
    const endpointStats = await prisma.aPIUsage.groupBy({
      by: ['endpoint'],
      where: {
        ...(provider && { provider }),
        success: true,
      },
      _sum: {
        estimatedCost: true,
        totalTokens: true,
      },
      _count: {
        id: true,
      },
      _avg: {
        estimatedCost: true,
      },
    });

    return endpointStats
      .map((stat) => ({
        endpoint: stat.endpoint,
        calls: stat._count.id || 0,
        totalTokens: stat._sum.totalTokens || 0,
        totalCost: (stat._sum.estimatedCost?.toNumber() || 0).toFixed(6),
        averageCostPerCall: (stat._avg.estimatedCost?.toNumber() || 0).toFixed(6),
      }))
      .sort((a, b) => parseFloat(b.totalCost) - parseFloat(a.totalCost));
  } catch (error) {
    console.error('Error fetching endpoint usage breakdown:', error);
    return [];
  }
}

/**
 * Check if we're within budget
 */
export async function isWithinBudget(provider: string): Promise<boolean> {
  try {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthlyUsage = await prisma.aPIUsage.aggregate({
      where: {
        provider,
        createdAt: { gte: monthStart },
        success: true,
      },
      _sum: {
        estimatedCost: true,
      },
    });

    const monthlyCost = monthlyUsage._sum.estimatedCost?.toNumber() || 0;
    return monthlyCost < ALERT_THRESHOLDS.monthlyBudget;
  } catch (error) {
    console.error('Error checking budget status:', error);
    return false;
  }
}

/**
 * Get remaining budget for the month
 */
export async function getRemainingBudget(provider: string): Promise<number> {
  try {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthlyUsage = await prisma.aPIUsage.aggregate({
      where: {
        provider,
        createdAt: { gte: monthStart },
        success: true,
      },
      _sum: {
        estimatedCost: true,
      },
    });

    const monthlyCost = monthlyUsage._sum.estimatedCost?.toNumber() || 0;
    const remaining = ALERT_THRESHOLDS.monthlyBudget - monthlyCost;

    return Math.max(0, remaining);
  } catch (error) {
    console.error('Error calculating remaining budget:', error);
    return 0;
  }
}
