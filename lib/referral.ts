/**
 * Referral Program Utilities
 * Phase C: Referral System
 */

import { prisma } from './prisma';
import { extendSubscription } from './subscription';

/**
 * Generate a unique referral code for a user
 */
export function generateReferralCode(userId: string, userName?: string): string {
  const baseCode = userName 
    ? userName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 6)
    : 'USER';
  
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const code = `${baseCode}${randomSuffix}`;
  
  return code;
}

/**
 * Create or get referral code for a user
 */
export async function getOrCreateReferralCode(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  if (user.referralCode) {
    return user.referralCode;
  }

  // Generate new referral code
  let referralCode = generateReferralCode(userId, user.name || undefined);
  let attempts = 0;
  const maxAttempts = 10;

  // Ensure uniqueness
  while (attempts < maxAttempts) {
    const existingUser = await prisma.user.findUnique({
      where: { referralCode },
    });

    if (!existingUser) {
      break;
    }

    // Code exists, generate a new one
    referralCode = generateReferralCode(userId, user.name || undefined);
    attempts++;
  }

  if (attempts >= maxAttempts) {
    throw new Error('Failed to generate unique referral code');
  }

  // Save referral code to user
  await prisma.user.update({
    where: { id: userId },
    data: { referralCode },
  });

  return referralCode;
}

/**
 * Validate a referral code
 */
export async function validateReferralCode(code: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { referralCode: code },
  });

  return user !== null;
}

/**
 * Apply referral code when a user signs up
 */
export async function applyReferralCode(
  newUserId: string,
  referralCode: string
): Promise<void> {
  // Find the referrer
  const referrer = await prisma.user.findUnique({
    where: { referralCode },
  });

  if (!referrer) {
    throw new Error('Invalid referral code');
  }

  // Check if user already used a referral code
  const newUser = await prisma.user.findUnique({
    where: { id: newUserId },
  });

  if (newUser?.referredBy) {
    throw new Error('User has already used a referral code');
  }

  // Get referee's email
  const refereeEmail = newUser?.email || '';

  // Update new user with referral info
  await prisma.user.update({
    where: { id: newUserId },
    data: { referredBy: referralCode },
  });

  // Create referral record
  await prisma.referral.create({
    data: {
      referrerId: referrer.id,
      refereeEmail,
      refereeUserId: newUserId,
      status: 'signed_up',
    },
  });

  // Award referrer with points for sign-up
  await prisma.user.update({
    where: { id: referrer.id },
    data: {
      points: { increment: 50 },
    },
  });

  // Create referral reward for sign-up
  await prisma.referralReward.create({
    data: {
      userId: referrer.id,
      type: 'referral_signup',
      rewardType: 'points',
      rewardValue: 50,
      description: `Earned 50 points for referring ${refereeEmail}`,
      applied: true,
      appliedAt: new Date(),
    },
  });
}

/**
 * Process referral reward when referee subscribes
 */
export async function processReferralSubscription(
  refereeUserId: string
): Promise<void> {
  const referee = await prisma.user.findUnique({
    where: { id: refereeUserId },
  });

  if (!referee || !referee.referredBy) {
    return; // No referral to process
  }

  // Find the referrer
  const referrer = await prisma.user.findUnique({
    where: { referralCode: referee.referredBy },
  });

  if (!referrer) {
    return;
  }

  // Update referral status
  await prisma.referral.updateMany({
    where: {
      referrerId: referrer.id,
      refereeUserId: refereeUserId,
      status: 'signed_up',
    },
    data: {
      status: 'subscribed',
      subscribedAt: new Date(),
    },
  });

  // Award referrer with 7 days of premium
  const premiumDays = 7;

  // Create referral reward
  const reward = await prisma.referralReward.create({
    data: {
      userId: referrer.id,
      type: 'referral_subscription',
      rewardType: 'premium_days',
      rewardValue: premiumDays,
      description: `Earned ${premiumDays} days of premium for referring a subscriber`,
      applied: false,
    },
  });

  // Check if referrer has an active subscription
  const referrerSubscription = await prisma.subscription.findUnique({
    where: { userId: referrer.id },
  });

  if (referrerSubscription) {
    // Extend existing subscription
    await extendSubscription(referrer.id, premiumDays);
    
    // Mark reward as applied
    await prisma.referralReward.update({
      where: { id: reward.id },
      data: {
        applied: true,
        appliedAt: new Date(),
      },
    });
  }
  // If no subscription, reward will be applied when they subscribe
}

/**
 * Get referral statistics for a user
 */
export async function getReferralStats(userId: string): Promise<{
  totalReferrals: number;
  signedUpReferrals: number;
  subscribedReferrals: number;
  totalRewards: number;
  appliedRewards: number;
  pendingRewards: number;
}> {
  const referrals = await prisma.referral.findMany({
    where: { referrerId: userId },
  });

  const rewards = await prisma.referralReward.findMany({
    where: { userId },
  });

  const totalReferrals = referrals.length;
  const signedUpReferrals = referrals.filter(r => r.status === 'signed_up' || r.status === 'subscribed').length;
  const subscribedReferrals = referrals.filter(r => r.status === 'subscribed').length;
  const totalRewards = rewards.length;
  const appliedRewards = rewards.filter(r => r.applied).length;
  const pendingRewards = rewards.filter(r => !r.applied).length;

  return {
    totalReferrals,
    signedUpReferrals,
    subscribedReferrals,
    totalRewards,
    appliedRewards,
    pendingRewards,
  };
}

/**
 * Get referral leaderboard
 */
export async function getReferralLeaderboard(limit: number = 10): Promise<Array<{
  userId: string;
  userName: string | null;
  referralCount: number;
  subscribedCount: number;
}>> {
  const referrals = await prisma.referral.groupBy({
    by: ['referrerId'],
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
    take: limit,
  });

  const leaderboard = await Promise.all(
    referrals.map(async (ref) => {
      const user = await prisma.user.findUnique({
        where: { id: ref.referrerId },
        select: { id: true, name: true },
      });

      const subscribedCount = await prisma.referral.count({
        where: {
          referrerId: ref.referrerId,
          status: 'subscribed',
        },
      });

      return {
        userId: ref.referrerId,
        userName: user?.name || null,
        referralCount: ref._count.id,
        subscribedCount,
      };
    })
  );

  return leaderboard;
}

/**
 * Apply pending rewards when user subscribes
 */
export async function applyPendingRewards(userId: string): Promise<void> {
  const pendingRewards = await prisma.referralReward.findMany({
    where: {
      userId,
      applied: false,
      rewardType: 'premium_days',
    },
  });

  if (pendingRewards.length === 0) {
    return;
  }

  // Calculate total days to add
  const totalDays = pendingRewards.reduce((sum, reward) => sum + reward.rewardValue, 0);

  // Extend subscription
  await extendSubscription(userId, totalDays);

  // Mark rewards as applied
  await prisma.referralReward.updateMany({
    where: {
      userId,
      applied: false,
      rewardType: 'premium_days',
    },
    data: {
      applied: true,
      appliedAt: new Date(),
    },
  });
}
