/**
 * User API: Create Payment Order
 * Phase C: Subscription System
 * 
 * Endpoints:
 * - POST: Create Razorpay order for subscription payment
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createRazorpayOrder } from '@/lib/razorpay';
import { handleApiError, unauthorizedError, notFoundError, validationError } from '@/lib/api-error-handler';

/**
 * POST /api/subscription/create-order
 * Create Razorpay order for subscription payment
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return unauthorizedError();
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return notFoundError('User not found');
    }

    const body = await req.json();
    const { planId } = body;

    if (!planId) {
      return validationError('Plan ID is required');
    }

    // Get subscription plan
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return notFoundError('Subscription plan not found');
    }

    if (!plan.isActive) {
      return validationError('This subscription plan is not active');
    }

    // Create Razorpay order
    const amount = Number(plan.price);
    const receipt = `sub_${user.id}_${Date.now()}`;
    const notes = {
      userId: user.id,
      planId: plan.id,
      planName: plan.name,
      userEmail: user.email,
    };

    const order = await createRazorpayOrder(amount, 'INR', receipt, notes);

    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'subscription',
        amount: plan.price,
        currency: 'INR',
        status: 'pending',
        razorpayOrderId: order.id,
        description: `Subscription to ${plan.displayName}`,
        metadata: {
          planId: plan.id,
          planName: plan.name,
          durationDays: plan.durationDays,
        },
      },
    });

    return NextResponse.json(
      {
        order: {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
        },
        plan: {
          id: plan.id,
          name: plan.displayName,
          price: plan.price,
          durationDays: plan.durationDays,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, 'Failed to create payment order');
  }
}
