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

/**
 * POST /api/subscription/trial
 * Start 1-day trial subscription for new users
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

    // Check if user already has a subscription
    const existingSubscription = await getUserSubscription(user.id);

    if (existingSubscription) {
      return NextResponse.json(
        { error: 'User already has a subscription' },
        { status: 400 }
      );
    }

    // Get the first available plan (or default plan)
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      take: 1,
    });

    if (plans.length === 0) {
      return NextResponse.json(
        { error: 'No subscription plans available' },
        { status: 400 }
      );
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
    console.error('Error starting trial subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
