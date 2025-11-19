/**
 * User API: Subscription Status
 * Phase C: Subscription System
 * 
 * Endpoints:
 * - GET: Get user's subscription status
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSubscriptionStatus } from '@/lib/subscription';
import { handleApiError, unauthorizedError, notFoundError } from '@/lib/api-error-handler';

/**
 * GET /api/subscription/status
 * Get current user's subscription status
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) return unauthorizedError();

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) return notFoundError('User not found');

    // Get subscription status
    const status = await getSubscriptionStatus(user.id);

    return NextResponse.json({ status }, { status: 200 });
  } catch (error) {
    return handleApiError(error, 'Failed to fetch subscription status');
  }
}
