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

/**
 * POST /api/subscription/cancel
 * Cancel user's active subscription
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has a subscription
    const existingSubscription = await getUserSubscription(user.id);

    if (!existingSubscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    if (existingSubscription.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Subscription is already cancelled' },
        { status: 400 }
      );
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
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
