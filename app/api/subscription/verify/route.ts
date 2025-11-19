/**
 * User API: Verify Payment and Activate Subscription
 * Phase C: Subscription System
 * 
 * Endpoints:
 * - POST: Verify Razorpay payment and activate subscription
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { activateSubscription } from '@/lib/subscription';
import { applyPendingRewards, processReferralSubscription } from '@/lib/referral';
import { handleApiError, unauthorizedError, notFoundError, validationError } from '@/lib/api-error-handler';

/**
 * POST /api/subscription/verify
 * Verify payment signature and activate subscription
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
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planId) {
      return validationError('Missing required payment details');
    }

    // Verify payment signature
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      // Update transaction as failed
      await prisma.transaction.updateMany({
        where: {
          userId: user.id,
          razorpayOrderId: razorpay_order_id,
        },
        data: {
          status: 'failed',
        },
      });

      return validationError('Payment verification failed');
    }

    // Get plan details
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return notFoundError('Subscription plan not found');
    }

    // Activate subscription
    const subscription = await activateSubscription(
      user.id,
      planId,
      plan.durationDays,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    // Update transaction as completed
    await prisma.transaction.updateMany({
      where: {
        userId: user.id,
        razorpayOrderId: razorpay_order_id,
      },
      data: {
        status: 'completed',
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
    });

    // Apply any pending referral rewards
    try {
      await applyPendingRewards(user.id);
    } catch (error) {
      console.error('Error applying pending rewards:', error);
    }

    // Process referral reward for referrer if user was referred
    try {
      await processReferralSubscription(user.id);
    } catch (error) {
      console.error('Error processing referral subscription:', error);
    }

    return NextResponse.json(
      {
        subscription,
        message: 'Payment verified and subscription activated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, 'Failed to verify payment');
  }
}
