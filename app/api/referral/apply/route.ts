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
import { handleApiError, unauthorizedError, notFoundError, validationError } from '@/lib/api-error-handler';

/**
 * POST /api/referral/apply
 * Apply referral code for new user
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) return unauthorizedError();

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) return notFoundError('User not found');

    const body = await req.json();
    const { referralCode } = body;

    if (!referralCode) return validationError('Referral code is required');

    // Validate referral code
    const isValid = await validateReferralCode(referralCode);

    if (!isValid) return validationError('Invalid referral code');

    // Check if user already used a referral code
    if (user.referredBy) {
      return validationError('You have already used a referral code');
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
    return handleApiError(error, 'Failed to apply referral code');
  }
}
