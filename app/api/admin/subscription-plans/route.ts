/**
 * Admin API: Subscription Plans Management
 * Phase C: Subscription System
 * 
 * Endpoints:
 * - GET: List all subscription plans
 * - POST: Create new subscription plan
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/auth/withAdminAuth';

/**
 * GET /api/admin/subscription-plans
 * List all subscription plans
 */
export const GET = withAdminAuth(async (req, { user }) => {
  const plans = await prisma.subscriptionPlan.findMany({
    orderBy: { order: 'asc' },
  });

  return NextResponse.json({ plans }, { status: 200 });
});

/**
 * POST /api/admin/subscription-plans
 * Create new subscription plan (admin only)
 */
export const POST = withAdminAuth(async (req, { user }) => {
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
});
