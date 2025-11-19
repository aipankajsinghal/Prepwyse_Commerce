/**
 * User API: Cancel Subscription
 * Phase C: Subscription System
 * 
 * Endpoints:
 * - POST: Cancel user's subscription
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cancelSubscription, getUserSubscription } from '@/lib/subscription';
import { handleApiError, unauthorizedError, notFoundError, validationError } from '@/lib/api-error-handler';

/**
 * POST /api/subscription/cancel
 * Cancel user's active subscription
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

    // Check if user has a subscription
    const existingSubscription = await getUserSubscription(user.id);

    if (!existingSubscription) {
      return notFoundError('No active subscription found');
    }

    if (existingSubscription.status === 'cancelled') {
      return validationError('Subscription is already cancelled');
    }

    // Cancel subscription
    const subscription = await cancelSubscription(user.id);

    return NextResponse.json(
      {
        subscription,
        message: 'Subscription cancelled successfully. Access will continue until the end date.',
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, 'Failed to cancel subscription');
  }
}
