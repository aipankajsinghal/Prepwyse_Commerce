/**
 * User API: Referral Code Management
 * Phase C: Referral System
 * 
 * Endpoints:
 * - GET: Get or create user's referral code
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateReferralCode } from '@/lib/referral';

/**
 * GET /api/referral/code
 * Get or create user's referral code
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

    // Get or create referral code
    const referralCode = await getOrCreateReferralCode(user.id);

    return NextResponse.json(
      {
        referralCode,
        referralUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/sign-up?ref=${referralCode}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error getting referral code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
