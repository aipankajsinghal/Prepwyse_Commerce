/**
 * Admin API: Affiliate Management
 * Manage affiliate partners and their applications
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

/**
 * GET /api/admin/affiliates
 * List all affiliate partners with filtering
 */
export const GET = withAdminAuth(async (req: NextRequest, { user }) => {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // "pending", "approved", "rejected", "suspended"
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const where: any = {};
  if (status) {
    where.status = status;
  }

  const [affiliates, total] = await Promise.all([
    prisma.affiliate.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            clicks: true,
            conversions: true,
          },
        },
      },
    }),
    prisma.affiliate.count({ where }),
  ]);

  return NextResponse.json({
    affiliates,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * POST /api/admin/affiliates
 * Manually create an affiliate (admin only)
 */
export const POST = withAdminAuth(async (req: NextRequest, { user }) => {
  const data = await req.json();
  const {
    companyName,
    contactName,
    email,
    phone,
    website,
    commissionRate,
  } = data;

  // Validate required fields
  if (!companyName || !contactName || !email || !commissionRate) {
    return NextResponse.json(
      { error: "Company name, contact name, email, and commission rate are required" },
      { status: 400 }
    );
  }

  // Check if email already exists
  const existing = await prisma.affiliate.findUnique({
    where: { email },
  });

  if (existing) {
    return NextResponse.json(
      { error: "An affiliate with this email already exists" },
      { status: 409 }
    );
  }

  // Generate unique affiliate code
  const baseCode = companyName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 6);
  let affiliateCode = `${baseCode}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  
  // Ensure uniqueness
  let attempts = 0;
  while (attempts < 10) {
    const existingCode = await prisma.affiliate.findUnique({
      where: { affiliateCode },
    });
    if (!existingCode) break;
    affiliateCode = `${baseCode}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    attempts++;
  }

  const affiliate = await prisma.affiliate.create({
    data: {
      companyName,
      contactName,
      email,
      phone,
      website,
      affiliateCode,
      commissionRate: parseFloat(commissionRate),
      status: "approved", // Directly approved by admin
      approvedBy: user.id,
      approvedAt: new Date(),
    },
  });

  // Log admin activity
  await prisma.adminActivity.create({
    data: {
      adminId: user.clerkId,
      adminName: user.name || user.email,
      action: "create",
      resourceType: "affiliate",
      resourceId: affiliate.id,
      description: `Created affiliate: ${companyName}`,
      metadata: {
        companyName,
        email,
        affiliateCode,
      },
    },
  });

  return NextResponse.json({ affiliate }, { status: 201 });
});
