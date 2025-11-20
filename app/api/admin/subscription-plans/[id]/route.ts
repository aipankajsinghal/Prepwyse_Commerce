/**
 * Admin API: Individual Subscription Plan Management
 * Phase C: Subscription System
 * 
 * Endpoints:
 * - GET: Get single subscription plan
 * - PATCH: Update subscription plan
 * - DELETE: Delete subscription plan
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuthParams } from '@/lib/auth/withAdminAuth';

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * GET /api/admin/subscription-plans/[id]
 * Get single subscription plan
 */
export const GET = withAdminAuthParams(async (req, { user, params }) => {
  if (!params?.id) {
    return NextResponse.json({ error: "Subscription plan ID is required" }, { status: 400 });
  }
  const { id } = params;

  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id },
  });

  if (!plan) {
    return NextResponse.json(
      { error: 'Subscription plan not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ plan }, { status: 200 });
});

/**
 * PATCH /api/admin/subscription-plans/[id]
 * Update subscription plan (admin only)
 */
export const PATCH = withAdminAuthParams(async (req, { user, params }) => {
  if (!params?.id) {
    return NextResponse.json({ error: "Subscription plan ID is required" }, { status: 400 });
  }
  const { id } = params;
  const body = await req.json();

  const {
    displayName,
    description,
    price,
    durationDays,
    features,
    isActive,
    order,
  } = body;

  // Check if plan exists
  const existingPlan = await prisma.subscriptionPlan.findUnique({
    where: { id },
  });

  if (!existingPlan) {
    return NextResponse.json(
      { error: 'Subscription plan not found' },
      { status: 404 }
    );
  }

  // Update plan
  const plan = await prisma.subscriptionPlan.update({
    where: { id },
    data: {
      ...(displayName && { displayName }),
      ...(description && { description }),
      ...(price !== undefined && { price }),
      ...(durationDays && { durationDays }),
      ...(features && { features }),
      ...(isActive !== undefined && { isActive }),
      ...(order !== undefined && { order }),
    },
  });

  return NextResponse.json(
    { plan, message: 'Subscription plan updated successfully' },
    { status: 200 }
  );
});

/**
 * DELETE /api/admin/subscription-plans/[id]
 * Delete subscription plan (admin only)
 */
export const DELETE = withAdminAuthParams(async (req, { user, params }) => {
  if (!params?.id) {
    return NextResponse.json({ error: "Subscription plan ID is required" }, { status: 400 });
  }
  const { id } = params;

  // Check if plan exists
  const existingPlan = await prisma.subscriptionPlan.findUnique({
    where: { id },
  });

  if (!existingPlan) {
    return NextResponse.json(
      { error: 'Subscription plan not found' },
      { status: 404 }
    );
  }

  // Check if plan has active subscriptions
  const activeSubscriptions = await prisma.subscription.count({
    where: {
      planId: id,
      status: { in: ['active', 'trial'] },
    },
  });

  if (activeSubscriptions > 0) {
    return NextResponse.json(
      { error: 'Cannot delete plan with active subscriptions. Please deactivate it instead.' },
      { status: 400 }
    );
  }

  // Delete plan
  await prisma.subscriptionPlan.delete({
    where: { id },
  });

  return NextResponse.json(
    { message: 'Subscription plan deleted successfully' },
    { status: 200 }
  );
});
