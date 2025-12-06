/**
 * Subscription Management Utilities
 * Phase C: Subscription System
 */

import { prisma } from './prisma';
import { Subscription, SubscriptionPlan, User } from '@prisma/client';

/**
 * Check if a user has an active subscription
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    include: { plan: true },
  });

  if (!subscription) {
    return false;
  }

  // Check if subscription is active or in trial
  if (subscription.status === 'active' || subscription.status === 'trial') {
    // Check if subscription has not expired
    if (new Date() <= subscription.endDate) {
      return true;
    }

    // If expired, update status
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'expired' },
    });
  }

  return false;
}

/**
 * Get user's current subscription
 */
export async function getUserSubscription(userId: string): Promise<(Subscription & { plan: SubscriptionPlan }) | null> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    include: { plan: true },
  });

  return subscription;
}

/**
 * Check if user is in trial period
 */
export async function isInTrial(userId: string): Promise<boolean> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) {
    return false;
  }

  return (
    subscription.status === 'trial' &&
    subscription.trialEndsAt !== null &&
    new Date() <= subscription.trialEndsAt
  );
}

/**
 * Get days remaining in subscription
 */
export async function getDaysRemaining(userId: string): Promise<number> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) {
    return 0;
  }

  const now = new Date();
  const endDate = subscription.endDate;

  if (now >= endDate) {
    return 0;
  }

  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Create a trial subscription for a new user
 */
export async function createTrialSubscription(
  userId: string,
  planId: string
): Promise<Subscription> {
  const now = new Date();
  const trialEndDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day trial
  
  const subscription = await prisma.subscription.create({
    data: {
      userId,
      planId,
      status: 'trial',
      trialEndsAt: trialEndDate,
      endDate: trialEndDate,
      autoRenew: false,
    },
  });

  return subscription;
}

/**
 * Activate paid subscription after successful payment
 *
 * @param userId - User ID
 * @param planId - Subscription plan ID
 * @param durationDays - Duration in days
 * @param razorpayOrderId - Razorpay order ID
 * @param razorpayPaymentId - Razorpay payment ID
 * @param razorpaySignature - Razorpay signature
 * @param tx - Optional transaction client (for ACID compliance in transactions)
 */
export async function activateSubscription(
  userId: string,
  planId: string,
  durationDays: number,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
  tx?: any // Prisma transaction client - if provided, uses transaction; otherwise uses global prisma
): Promise<Subscription> {
  const now = new Date();
  const endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

  // Use transaction client if provided, otherwise use global prisma
  const client = tx || prisma;

  // Check if user already has a subscription
  const existingSubscription = await client.subscription.findUnique({
    where: { userId },
  });

  if (existingSubscription) {
    // Update existing subscription
    const subscription = await client.subscription.update({
      where: { userId },
      data: {
        planId,
        status: 'active',
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        startDate: now,
        endDate,
        autoRenew: true,
        trialEndsAt: null,
      },
    });

    return subscription;
  } else {
    // Create new subscription
    const subscription = await client.subscription.create({
      data: {
        userId,
        planId,
        status: 'active',
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        startDate: now,
        endDate,
        autoRenew: true,
      },
    });

    return subscription;
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(userId: string): Promise<Subscription> {
  const subscription = await prisma.subscription.update({
    where: { userId },
    data: {
      status: 'cancelled',
      autoRenew: false,
      cancelledAt: new Date(),
    },
  });

  return subscription;
}

/**
 * Extend subscription by adding days (for referral rewards)
 */
export async function extendSubscription(
  userId: string,
  daysToAdd: number
): Promise<Subscription> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) {
    throw new Error('No subscription found for user');
  }

  const currentEndDate = subscription.endDate;
  const newEndDate = new Date(
    currentEndDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000
  );

  const updatedSubscription = await prisma.subscription.update({
    where: { userId },
    data: { endDate: newEndDate },
  });

  return updatedSubscription;
}

/**
 * Check if user can access premium features
 */
export async function canAccessPremiumFeatures(userId: string): Promise<boolean> {
  return await hasActiveSubscription(userId);
}

/**
 * Get subscription status info for user
 */
export async function getSubscriptionStatus(userId: string): Promise<{
  hasSubscription: boolean;
  isActive: boolean;
  isTrial: boolean;
  daysRemaining: number;
  plan: SubscriptionPlan | null;
  endDate: Date | null;
}> {
  const subscription = await getUserSubscription(userId);

  if (!subscription) {
    return {
      hasSubscription: false,
      isActive: false,
      isTrial: false,
      daysRemaining: 0,
      plan: null,
      endDate: null,
    };
  }

  const isActive = await hasActiveSubscription(userId);
  const isTrial = await isInTrial(userId);
  const daysRemaining = await getDaysRemaining(userId);

  return {
    hasSubscription: true,
    isActive,
    isTrial,
    daysRemaining,
    plan: subscription.plan,
    endDate: subscription.endDate,
  };
}
