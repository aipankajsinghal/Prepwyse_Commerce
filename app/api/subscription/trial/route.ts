/**
 * User API: Start Trial Subscription
 * Phase C: Subscription System
 * 
 * Endpoints:
 * - POST: Start 1-day trial subscription
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createTrialSubscription, getUserSubscription } from '@/lib/subscription';
import { handleApiError, unauthorizedError, notFoundError, validationError } from '@/lib/api-error-handler';

/**
 * POST /api/subscription/trial
 * Start 1-day trial subscription for new users
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) return unauthorizedError();

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) return notFoundError('User not found');

    // Check if user already has a subscription
    const existingSubscription = await getUserSubscription(user.id);

    if (existingSubscription) {
      return validationError('User already has a subscription');
    }

    // Get the first available plan (or default plan)
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      take: 1,
    });

    if (plans.length === 0) {
      return validationError('No subscription plans available');
    }

    const plan = plans[0];

    // Create trial subscription
    const subscription = await createTrialSubscription(user.id, plan.id);

    return NextResponse.json(
      {
        subscription,
        message: 'Trial subscription started successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, 'Failed to start trial subscription');
  }
}
