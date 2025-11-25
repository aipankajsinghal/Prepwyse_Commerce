/**
 * Admin API: Coupon Management
 * CRUD operations for discount coupons
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

/**
 * GET /api/admin/coupons
 * List all coupons with optional filters
 */
export const GET = withAdminAuth(async (req: NextRequest, { user }) => {
  const { searchParams } = new URL(req.url);
  const isActive = searchParams.get("isActive");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const where: any = {};
  if (isActive !== null) {
    where.isActive = isActive === "true";
  }

  const [coupons, total] = await Promise.all([
    prisma.coupon.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { usages: true },
        },
      },
    }),
    prisma.coupon.count({ where }),
  ]);

  return NextResponse.json({
    coupons,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * POST /api/admin/coupons
 * Create a new coupon
 */
export const POST = withAdminAuth(async (req: NextRequest, { user }) => {
  const data = await req.json();
  const {
    code,
    description,
    discountType,
    discountValue,
    maxDiscount,
    minPurchase,
    usageLimit,
    userUsageLimit,
    startDate,
    endDate,
    applicablePlans,
    isActive,
  } = data;

  // Validate required fields
  if (!code || !discountType || !discountValue) {
    return NextResponse.json(
      { error: "Code, discount type, and discount value are required" },
      { status: 400 }
    );
  }

  // Validate discount type
  if (!["percentage", "fixed"].includes(discountType)) {
    return NextResponse.json(
      { error: "Discount type must be 'percentage' or 'fixed'" },
      { status: 400 }
    );
  }

  // Validate discount value
  if (discountType === "percentage" && (discountValue <= 0 || discountValue > 100)) {
    return NextResponse.json(
      { error: "Percentage discount must be between 0 and 100" },
      { status: 400 }
    );
  }

  // Check if code already exists
  const existing = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Coupon code already exists" },
      { status: 409 }
    );
  }

  const coupon = await prisma.coupon.create({
    data: {
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue: parseFloat(discountValue),
      maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
      minPurchase: minPurchase ? parseFloat(minPurchase) : null,
      usageLimit: usageLimit ? parseInt(usageLimit) : null,
      userUsageLimit: userUsageLimit ? parseInt(userUsageLimit) : 1,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      applicablePlans: applicablePlans || null,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: user.id,
    },
  });

  // Log admin activity
  await prisma.adminActivity.create({
    data: {
      adminId: user.clerkId,
      adminName: user.name || user.email,
      action: "create",
      resourceType: "coupon",
      resourceId: coupon.id,
      description: `Created coupon: ${code}`,
      metadata: {
        code,
        discountType,
        discountValue,
      },
    },
  });

  return NextResponse.json({ coupon }, { status: 201 });
});
