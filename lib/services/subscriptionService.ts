/**
 * Subscription Service
 * 
 * Centralizes all subscription-related database operations.
 * Handles subscription plans, user subscriptions, and payment processing.
 */

import { prisma } from "@/lib/prisma";
import { Subscription, SubscriptionPlan, Prisma } from "@prisma/client";

/**
 * Get all subscription plans
 */
export async function getSubscriptionPlans() {
  return await prisma.subscriptionPlan.findMany({
    where: {
      isActive: true,
    },
    orderBy: { price: "asc" },
  });
}

/**
 * Get subscription plan by ID
 */
export async function getSubscriptionPlanById(
  id: string
): Promise<SubscriptionPlan | null> {
  return await prisma.subscriptionPlan.findUnique({
    where: { id },
  });
}

/**
 * Create subscription plan (admin only)
 */
export async function createSubscriptionPlan(
  data: Prisma.SubscriptionPlanCreateInput
): Promise<SubscriptionPlan> {
  return await prisma.subscriptionPlan.create({
    data,
  });
}

/**
 * Update subscription plan (admin only)
 */
export async function updateSubscriptionPlan(
  id: string,
  data: Prisma.SubscriptionPlanUpdateInput
): Promise<SubscriptionPlan> {
  return await prisma.subscriptionPlan.update({
    where: { id },
    data,
  });
}

/**
 * Delete subscription plan (admin only)
 */
export async function deleteSubscriptionPlan(id: string): Promise<void> {
  await prisma.subscriptionPlan.delete({
    where: { id },
  });
}

/**
 * Get user's subscription
 */
export async function getUserSubscription(userId: string) {
  return await prisma.subscription.findUnique({
    where: { userId },
    include: {
      plan: true,
    },
  });
}

/**
 * Create user subscription
 */
export async function createSubscription(
  userId: string,
  planId: string,
  razorpayOrderId?: string,
  razorpayPaymentId?: string
): Promise<Subscription> {
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    throw new Error("Subscription plan not found");
  }

  // Calculate end date based on plan duration
  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + plan.durationDays);

  return await prisma.subscription.create({
    data: {
      userId,
      planId,
      status: "ACTIVE",
      startDate: now,
      endDate,
      razorpayOrderId,
      razorpayPaymentId,
    },
  });
}

/**
 * Update subscription status
 */
export async function updateSubscriptionStatus(
  userId: string,
  status: "ACTIVE" | "CANCELLED" | "EXPIRED"
): Promise<Subscription> {
  return await prisma.subscription.update({
    where: { userId },
    data: {
      status,
      ...(status === "CANCELLED" && { cancelledAt: new Date() }),
    },
  });
}

/**
 * Renew subscription
 */
export async function renewSubscription(
  userId: string,
  razorpayOrderId?: string,
  razorpayPaymentId?: string
): Promise<Subscription> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    include: { plan: true },
  });

  if (!subscription) {
    throw new Error("Subscription not found");
  }

  // Calculate new end date
  const now = new Date();
  const newEndDate = new Date(now);
  newEndDate.setDate(newEndDate.getDate() + subscription.plan.durationDays);

  return await prisma.subscription.update({
    where: { userId },
    data: {
      status: "ACTIVE",
      startDate: now,
      endDate: newEndDate,
      cancelledAt: null,
      razorpayOrderId,
      razorpayPaymentId,
    },
  });
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(userId: string): Promise<Subscription> {
  return await prisma.subscription.update({
    where: { userId },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
    },
  });
}

/**
 * Check if user has active subscription
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) {
    return false;
  }

  return (
    subscription.status === "ACTIVE" &&
    subscription.endDate > new Date()
  );
}

/**
 * Get subscription statistics (admin)
 */
export async function getSubscriptionStatistics() {
  const total = await prisma.subscription.count();
  const active = await prisma.subscription.count({
    where: { status: "ACTIVE" },
  });
  const cancelled = await prisma.subscription.count({
    where: { status: "CANCELLED" },
  });
  const expired = await prisma.subscription.count({
    where: { status: "EXPIRED" },
  });

  // Revenue calculation
  const activeSubscriptions = await prisma.subscription.findMany({
    where: { status: "ACTIVE" },
    include: { plan: true },
  });

  const monthlyRevenue = activeSubscriptions.reduce(
    (sum, sub) => sum + Number(sub.plan.price),
    0
  );

  return {
    total,
    active,
    cancelled,
    expired,
    monthlyRevenue,
  };
}

/**
 * Get expiring subscriptions (for reminder notifications)
 */
export async function getExpiringSubscriptions(daysBeforeExpiry: number = 7) {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysBeforeExpiry);

  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);

  return await prisma.subscription.findMany({
    where: {
      status: "ACTIVE",
      endDate: {
        gte: targetDate,
        lt: nextDay,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      plan: true,
    },
  });
}

/**
 * Process expired subscriptions (to be run daily via cron job)
 */
export async function processExpiredSubscriptions() {
  const now = new Date();

  const expiredSubs = await prisma.subscription.updateMany({
    where: {
      status: "ACTIVE",
      endDate: {
        lt: now,
      },
    },
    data: {
      status: "EXPIRED",
    },
  });

  return expiredSubs.count;
}

/**
 * Start trial subscription
 */
export async function startTrialSubscription(
  userId: string,
  trialDays: number = 7
): Promise<Subscription> {
  // Check if user already had a trial
  const existingSubscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (existingSubscription) {
    throw new Error("User already has or had a subscription");
  }

  // Get trial plan or create temporary one
  const trialPlan = await prisma.subscriptionPlan.findFirst({
    where: { name: { contains: "Trial" } },
  });

  if (!trialPlan) {
    throw new Error("Trial plan not found");
  }

  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + trialDays);

  return await prisma.subscription.create({
    data: {
      userId,
      planId: trialPlan.id,
      status: "ACTIVE",
      startDate: now,
      endDate,
    },
  });
}
