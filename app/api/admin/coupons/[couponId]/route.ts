/**
 * Admin API: Individual Coupon Management
 * Update and delete coupons
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuthParams } from "@/lib/auth/withAdminAuth";

/**
 * GET /api/admin/coupons/[couponId]
 * Get coupon details including usage statistics
 */
export const GET = withAdminAuthParams(async (req: NextRequest, { user, params }) => {
  if (!params?.couponId) {
    return NextResponse.json(
      { error: "Coupon ID is required" },
      { status: 400 }
    );
  }
  const { couponId } = params;

  const coupon = await prisma.coupon.findUnique({
    where: { id: couponId },
    include: {
      usages: {
        take: 50,
        orderBy: { usedAt: "desc" },
        include: {
          coupon: {
            select: { code: true },
          },
        },
      },
      _count: {
        select: { usages: true },
      },
    },
  });

  if (!coupon) {
    return NextResponse.json(
      { error: "Coupon not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ coupon });
});

/**
 * PATCH /api/admin/coupons/[couponId]
 * Update a coupon
 */
export const PATCH = withAdminAuthParams(async (req: NextRequest, { user, params }) => {
  if (!params?.couponId) {
    return NextResponse.json(
      { error: "Coupon ID is required" },
      { status: 400 }
    );
  }
  const { couponId } = params;
  const data = await req.json();

  const coupon = await prisma.coupon.findUnique({
    where: { id: couponId },
  });

  if (!coupon) {
    return NextResponse.json(
      { error: "Coupon not found" },
      { status: 404 }
    );
  }

  // Validate discount type if provided
  if (data.discountType && !["percentage", "fixed"].includes(data.discountType)) {
    return NextResponse.json(
      { error: "Discount type must be 'percentage' or 'fixed'" },
      { status: 400 }
    );
  }

  const updatedCoupon = await prisma.coupon.update({
    where: { id: couponId },
    data: {
      description: data.description,
      discountType: data.discountType,
      discountValue: data.discountValue ? parseFloat(data.discountValue) : undefined,
      maxDiscount: data.maxDiscount !== undefined ? (data.maxDiscount ? parseFloat(data.maxDiscount) : null) : undefined,
      minPurchase: data.minPurchase !== undefined ? (data.minPurchase ? parseFloat(data.minPurchase) : null) : undefined,
      usageLimit: data.usageLimit !== undefined ? (data.usageLimit ? parseInt(data.usageLimit) : null) : undefined,
      userUsageLimit: data.userUsageLimit ? parseInt(data.userUsageLimit) : undefined,
      endDate: data.endDate !== undefined ? (data.endDate ? new Date(data.endDate) : null) : undefined,
      applicablePlans: data.applicablePlans !== undefined ? data.applicablePlans : undefined,
      isActive: data.isActive,
    },
  });

  // Log admin activity
  await prisma.adminActivity.create({
    data: {
      adminId: user.clerkId,
      adminName: user.name || user.email,
      action: "update",
      resourceType: "coupon",
      resourceId: couponId,
      description: `Updated coupon: ${coupon.code}`,
      metadata: {
        code: coupon.code,
        changes: data,
      },
    },
  });

  return NextResponse.json({ coupon: updatedCoupon });
});

/**
 * DELETE /api/admin/coupons/[couponId]
 * Delete a coupon
 */
export const DELETE = withAdminAuthParams(async (req: NextRequest, { user, params }) => {
  if (!params?.couponId) {
    return NextResponse.json(
      { error: "Coupon ID is required" },
      { status: 400 }
    );
  }
  const { couponId } = params;

  const coupon = await prisma.coupon.findUnique({
    where: { id: couponId },
    include: {
      _count: {
        select: { usages: true },
      },
    },
  });

  if (!coupon) {
    return NextResponse.json(
      { error: "Coupon not found" },
      { status: 404 }
    );
  }

  await prisma.coupon.delete({
    where: { id: couponId },
  });

  // Log admin activity
  await prisma.adminActivity.create({
    data: {
      adminId: user.clerkId,
      adminName: user.name || user.email,
      action: "delete",
      resourceType: "coupon",
      resourceId: couponId,
      description: `Deleted coupon: ${coupon.code}`,
      metadata: {
        code: coupon.code,
        usageCount: coupon._count.usages,
      },
    },
  });

  return NextResponse.json({
    success: true,
    message: "Coupon deleted successfully",
  });
});
