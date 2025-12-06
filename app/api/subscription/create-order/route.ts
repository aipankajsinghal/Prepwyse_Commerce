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
import { withRedisRateLimit, strictRateLimit } from '@/lib/middleware/redis-rateLimit';

/**
 * POST /api/subscription/create-order
 * Create Razorpay order for subscription payment
 */
async function handler(req: NextRequest): Promise<NextResponse> {
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
    const { planId, couponCode } = body;

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

    // Calculate amount with coupon discount if provided
    let finalAmount = Number(plan.price);
    let discountAmount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });

      if (coupon) {
        // Validate coupon
        const now = new Date();
        const isValid =
          coupon.isActive &&
          now >= coupon.startDate &&
          (!coupon.endDate || now <= coupon.endDate) &&
          (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit) &&
          (!coupon.applicablePlans || (coupon.applicablePlans as any).includes(planId));

        if (isValid) {
          // Check user usage limit
          const userUsageCount = await prisma.couponUsage.count({
            where: {
              couponId: coupon.id,
              userId: user.id,
            },
          });

          if (userUsageCount < coupon.userUsageLimit) {
            // Check minimum purchase requirement
            if (!coupon.minPurchase || finalAmount >= Number(coupon.minPurchase)) {
              // Calculate discount
              if (coupon.discountType === 'percentage') {
                discountAmount = (finalAmount * Number(coupon.discountValue)) / 100;
                if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
                  discountAmount = Number(coupon.maxDiscount);
                }
              } else {
                // Fixed discount
                discountAmount = Number(coupon.discountValue);
              }

              // Ensure discount doesn't exceed the plan price
              discountAmount = Math.min(discountAmount, finalAmount);
              finalAmount = finalAmount - discountAmount;
              appliedCoupon = coupon;
            }
          }
        }
      }
    }

    // Create Razorpay order
    const amount = finalAmount;
    const receipt = `sub_${user.id}_${Date.now()}`;
    const notes: Record<string, string> = {
      userId: user.id,
      planId: plan.id,
      planName: plan.name,
      userEmail: user.email,
    };
    
    if (appliedCoupon?.code) {
      notes.couponCode = appliedCoupon.code;
    }

    const order = await createRazorpayOrder(amount, 'INR', receipt, notes);

    // Wrap transaction and coupon usage in a database transaction
    // This ensures all-or-nothing: if any step fails, everything is rolled back
    const transaction = await prisma.$transaction(async (tx) => {
      // Create transaction record
      const newTransaction = await tx.transaction.create({
        data: {
          userId: user.id,
          type: 'subscription',
          amount: finalAmount,
          currency: 'INR',
          status: 'pending',
          razorpayOrderId: order.id,
          description: `Subscription to ${plan.displayName}`,
          metadata: {
            planId: plan.id,
            planName: plan.name,
            durationDays: plan.durationDays,
            originalAmount: Number(plan.price),
            discountAmount: discountAmount,
            couponCode: appliedCoupon?.code || null,
          },
        },
      });

      // Record coupon usage if applied (within transaction)
      if (appliedCoupon) {
        await tx.couponUsage.create({
          data: {
            couponId: appliedCoupon.id,
            userId: user.id,
            transactionId: newTransaction.id,
            discountAmount: discountAmount,
          },
        });

        // Increment coupon usage count (within transaction)
        await tx.coupon.update({
          where: { id: appliedCoupon.id },
          data: {
            usageCount: { increment: 1 },
          },
        });
      }

      return newTransaction;
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
        discount: appliedCoupon
          ? {
              code: appliedCoupon.code,
              amount: discountAmount,
              finalAmount: finalAmount,
            }
          : null,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, 'Failed to create payment order');
  }
}

// Apply rate limiting: 10 requests per minute (strict limit for sensitive payment endpoint)
export const POST = withRedisRateLimit(handler, strictRateLimit);
