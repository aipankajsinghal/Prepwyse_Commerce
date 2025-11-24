/**
 * User API: Coupon Validation
 * Validate coupon codes before applying during checkout
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, unauthorizedError, notFoundError } from "@/lib/api-error-handler";

/**
 * POST /api/coupons/validate
 * Validate a coupon code for a specific plan
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return unauthorizedError();
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return notFoundError("User not found");
    }

    const body = await req.json();
    const { code, planId, amount } = body;

    if (!code || !planId || !amount) {
      return NextResponse.json(
        { error: "Coupon code, plan ID, and amount are required" },
        { status: 400 }
      );
    }

    // Find coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json(
        { valid: false, error: "Invalid coupon code" },
        { status: 200 }
      );
    }

    // Validate coupon
    const now = new Date();
    const validationErrors = [];

    if (!coupon.isActive) {
      validationErrors.push("Coupon is not active");
    }

    if (now < coupon.startDate) {
      validationErrors.push("Coupon is not yet valid");
    }

    if (coupon.endDate && now > coupon.endDate) {
      validationErrors.push("Coupon has expired");
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      validationErrors.push("Coupon usage limit reached");
    }

    if (coupon.applicablePlans) {
      const applicablePlans = coupon.applicablePlans as string[];
      if (!applicablePlans.includes(planId)) {
        validationErrors.push("Coupon is not applicable to this plan");
      }
    }

    // Check user usage limit
    const userUsageCount = await prisma.couponUsage.count({
      where: {
        couponId: coupon.id,
        userId: user.id,
      },
    });

    if (userUsageCount >= coupon.userUsageLimit) {
      validationErrors.push("You have already used this coupon");
    }

    // Check minimum purchase requirement
    if (coupon.minPurchase && amount < Number(coupon.minPurchase)) {
      validationErrors.push(
        `Minimum purchase of ₹${coupon.minPurchase} required`
      );
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          valid: false,
          error: validationErrors[0],
          errors: validationErrors,
        },
        { status: 200 }
      );
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (amount * Number(coupon.discountValue)) / 100;
      if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
        discountAmount = Number(coupon.maxDiscount);
      }
    } else {
      // Fixed discount
      discountAmount = Number(coupon.discountValue);
    }

    // Ensure discount doesn't exceed the amount
    discountAmount = Math.min(discountAmount, amount);
    const finalAmount = amount - discountAmount;

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      discount: {
        amount: discountAmount,
        finalAmount: finalAmount,
        originalAmount: amount,
      },
    });
  } catch (error) {
    return handleApiError(error, "Failed to validate coupon");
  }
}
