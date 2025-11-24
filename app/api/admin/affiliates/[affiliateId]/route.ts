/**
 * Admin API: Individual Affiliate Management
 * Approve, reject, update, and manage individual affiliates
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuthParams } from "@/lib/auth/withAdminAuth";

/**
 * GET /api/admin/affiliates/[affiliateId]
 * Get detailed affiliate information with statistics
 */
export const GET = withAdminAuthParams(async (req: NextRequest, { user, params }) => {
  if (!params?.affiliateId) {
    return NextResponse.json(
      { error: "Affiliate ID is required" },
      { status: 400 }
    );
  }
  const { affiliateId } = params;

  const affiliate = await prisma.affiliate.findUnique({
    where: { id: affiliateId },
    include: {
      clicks: {
        take: 100,
        orderBy: { clickedAt: "desc" },
      },
      conversions: {
        take: 50,
        orderBy: { createdAt: "desc" },
      },
      payouts: {
        take: 20,
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: {
          clicks: true,
          conversions: true,
        },
      },
    },
  });

  if (!affiliate) {
    return NextResponse.json(
      { error: "Affiliate not found" },
      { status: 404 }
    );
  }

  // Calculate statistics
  const totalConversions = await prisma.affiliateConversion.count({
    where: { affiliateId, status: "approved" },
  });

  const totalCommission = await prisma.affiliateConversion.aggregate({
    where: { affiliateId, status: "approved" },
    _sum: { commissionAmount: true },
  });

  const paidCommission = await prisma.affiliateConversion.aggregate({
    where: { affiliateId, status: "paid" },
    _sum: { commissionAmount: true },
  });

  const stats = {
    totalClicks: affiliate._count.clicks,
    totalConversions,
    conversionRate: affiliate._count.clicks > 0 
      ? ((totalConversions / affiliate._count.clicks) * 100).toFixed(2)
      : "0.00",
    totalCommission: Number(totalCommission._sum.commissionAmount || 0),
    paidCommission: Number(paidCommission._sum.commissionAmount || 0),
    pendingCommission: Number(totalCommission._sum.commissionAmount || 0) - Number(paidCommission._sum.commissionAmount || 0),
  };

  return NextResponse.json({ affiliate, stats });
});

/**
 * PATCH /api/admin/affiliates/[affiliateId]
 * Update affiliate details or approve/reject application
 */
export const PATCH = withAdminAuthParams(async (req: NextRequest, { user, params }) => {
  if (!params?.affiliateId) {
    return NextResponse.json(
      { error: "Affiliate ID is required" },
      { status: 400 }
    );
  }
  const { affiliateId } = params;
  const data = await req.json();

  const affiliate = await prisma.affiliate.findUnique({
    where: { id: affiliateId },
  });

  if (!affiliate) {
    return NextResponse.json(
      { error: "Affiliate not found" },
      { status: 404 }
    );
  }

  // Prepare update data
  const updateData: any = {
    companyName: data.companyName,
    contactName: data.contactName,
    phone: data.phone,
    website: data.website,
    commissionRate: data.commissionRate ? parseFloat(data.commissionRate) : undefined,
    paymentMethod: data.paymentMethod,
    paymentDetails: data.paymentDetails,
  };

  // Handle status changes (approval/rejection/suspension)
  if (data.status && data.status !== affiliate.status) {
    updateData.status = data.status;

    if (data.status === "approved") {
      updateData.approvedBy = user.id;
      updateData.approvedAt = new Date();
      updateData.rejectedReason = null;
    } else if (data.status === "rejected") {
      updateData.rejectedReason = data.rejectedReason || "Application rejected by admin";
    }
  }

  const updatedAffiliate = await prisma.affiliate.update({
    where: { id: affiliateId },
    data: updateData,
  });

  // Log admin activity
  await prisma.adminActivity.create({
    data: {
      adminId: user.clerkId,
      adminName: user.name || user.email,
      action: "update",
      resourceType: "affiliate",
      resourceId: affiliateId,
      description: `Updated affiliate: ${updatedAffiliate.companyName}`,
      metadata: {
        changes: data,
        previousStatus: affiliate.status,
        newStatus: updatedAffiliate.status,
      },
    },
  });

  return NextResponse.json({ affiliate: updatedAffiliate });
});

/**
 * DELETE /api/admin/affiliates/[affiliateId]
 * Delete an affiliate
 */
export const DELETE = withAdminAuthParams(async (req: NextRequest, { user, params }) => {
  if (!params?.affiliateId) {
    return NextResponse.json(
      { error: "Affiliate ID is required" },
      { status: 400 }
    );
  }
  const { affiliateId } = params;

  const affiliate = await prisma.affiliate.findUnique({
    where: { id: affiliateId },
  });

  if (!affiliate) {
    return NextResponse.json(
      { error: "Affiliate not found" },
      { status: 404 }
    );
  }

  await prisma.affiliate.delete({
    where: { id: affiliateId },
  });

  // Log admin activity
  await prisma.adminActivity.create({
    data: {
      adminId: user.clerkId,
      adminName: user.name || user.email,
      action: "delete",
      resourceType: "affiliate",
      resourceId: affiliateId,
      description: `Deleted affiliate: ${affiliate.companyName}`,
      metadata: {
        companyName: affiliate.companyName,
        email: affiliate.email,
      },
    },
  });

  return NextResponse.json({
    success: true,
    message: "Affiliate deleted successfully",
  });
});
