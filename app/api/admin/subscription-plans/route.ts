/**
 * Admin API: Subscription Plans Management
 * Phase C: Subscription System
 * 
 * Endpoints:
 * - GET: List all subscription plans
 * - POST: Create new subscription plan
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/subscription-plans
 * List all subscription plans
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Add admin role check
    // For now, all authenticated users can view plans

    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ plans }, { status: 200 });
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/subscription-plans
 * Create new subscription plan (admin only)
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Add admin role check
    // For now, this should be restricted to admin users only

    const body = await req.json();
    const {
      name,
      displayName,
      description,
      price,
      durationDays,
      features,
      isActive,
      order,
    } = body;

    // Validate required fields
    if (!name || !displayName || !description || price === undefined || !durationDays) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if plan with same name already exists
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { name },
    });

    if (existingPlan) {
      return NextResponse.json(
        { error: 'Plan with this name already exists' },
        { status: 400 }
      );
    }

    // Create subscription plan
    const plan = await prisma.subscriptionPlan.create({
      data: {
        name,
        displayName,
        description,
        price,
        durationDays,
        features: features || [],
        isActive: isActive !== undefined ? isActive : true,
        order: order || 0,
      },
    });

    return NextResponse.json(
      { plan, message: 'Subscription plan created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating subscription plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
