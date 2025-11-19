/**
 * User API: Referral Leaderboard
 * Phase C: Referral System
 * 
 * Endpoints:
 * - GET: Get referral leaderboard
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { getReferralLeaderboard } from '@/lib/referral';
import { handleApiError, unauthorizedError } from '@/lib/api-error-handler';

/**
 * GET /api/referral/leaderboard
 * Get referral leaderboard (top referrers)
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) return unauthorizedError();

    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get referral leaderboard
    const leaderboard = await getReferralLeaderboard(limit);

    return NextResponse.json(
      { leaderboard },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, 'Failed to fetch referral leaderboard');
  }
}
