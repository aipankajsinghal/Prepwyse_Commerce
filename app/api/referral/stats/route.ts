/**
 * User API: Referral Statistics
 * Phase C: Referral System
 * 
 * Endpoints:
 * - GET: Get user's referral statistics
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getReferralStats } from '@/lib/referral';

/**
 * GET /api/referral/stats
 * Get user's referral statistics and rewards
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
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

    // Get referral statistics
    const stats = await getReferralStats(user.id);

    // Get recent referrals
    const recentReferrals = await prisma.referral.findMany({
      where: { referrerId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Get rewards
    const rewards = await prisma.referralReward.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      {
        stats,
        recentReferrals,
        rewards,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
