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

/**
 * POST /api/subscription/create-order
 * Create Razorpay order for subscription payment
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

    const body = await req.json();
    const { planId } = body;

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    // Get subscription plan
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Subscription plan not found' },
        { status: 404 }
      );
    }

    if (!plan.isActive) {
      return NextResponse.json(
        { error: 'This subscription plan is not active' },
        { status: 400 }
      );
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
    console.error('Error creating payment order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
