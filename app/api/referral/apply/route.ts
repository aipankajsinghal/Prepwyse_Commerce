/**
 * User API: Apply Referral Code
 * Phase C: Referral System
 * 
 * Endpoints:
 * - POST: Apply referral code for new user
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { applyReferralCode, validateReferralCode } from '@/lib/referral';

/**
 * POST /api/referral/apply
 * Apply referral code for new user
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
    const { referralCode } = body;

    if (!referralCode) {
      return NextResponse.json(
        { error: 'Referral code is required' },
        { status: 400 }
      );
    }

    // Validate referral code
    const isValid = await validateReferralCode(referralCode);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid referral code' },
        { status: 400 }
      );
    }

    // Check if user already used a referral code
    if (user.referredBy) {
      return NextResponse.json(
        { error: 'You have already used a referral code' },
        { status: 400 }
      );
    }

    // Apply referral code
    await applyReferralCode(user.id, referralCode);

    return NextResponse.json(
      {
        message: 'Referral code applied successfully! Your referrer has been rewarded.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error applying referral code:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
