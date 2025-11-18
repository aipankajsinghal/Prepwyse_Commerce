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

/**
 * GET /api/referral/leaderboard
 * Get referral leaderboard (top referrers)
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

    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get referral leaderboard
    const leaderboard = await getReferralLeaderboard(limit);

    return NextResponse.json(
      { leaderboard },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching referral leaderboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
