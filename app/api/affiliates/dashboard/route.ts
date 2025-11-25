/**
 * Public API: Affiliate Dashboard
 * Allow affiliates to view their performance metrics
 * This endpoint requires affiliate email and code for authentication
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * POST /api/affiliates/dashboard
 * Get affiliate dashboard statistics
 * Requires email and affiliateCode for authentication
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const data = await req.json();
    const { email, affiliateCode } = data;

    if (!email || !affiliateCode) {
      return NextResponse.json(
        { error: "Email and affiliate code are required" },
        { status: 400 }
      );
    }

    // Find and authenticate affiliate
    const affiliate = await prisma.affiliate.findFirst({
      where: {
        email,
        affiliateCode,
      },
    });

    if (!affiliate) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Get statistics
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Total stats
    const [
      totalClicks,
      totalConversions,
      totalCommission,
      paidCommission,
      clicksLast30Days,
      conversionsLast30Days,
      clicksLast7Days,
      conversionsLast7Days,
    ] = await Promise.all([
      prisma.affiliateClick.count({ where: { affiliateId: affiliate.id } }),
      prisma.affiliateConversion.count({ where: { affiliateId: affiliate.id } }),
      prisma.affiliateConversion.aggregate({
        where: { affiliateId: affiliate.id },
        _sum: { commissionAmount: true },
      }),
      prisma.affiliateConversion.aggregate({
        where: { affiliateId: affiliate.id, status: "paid" },
        _sum: { commissionAmount: true },
      }),
      prisma.affiliateClick.count({
        where: {
          affiliateId: affiliate.id,
          clickedAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.affiliateConversion.count({
        where: {
          affiliateId: affiliate.id,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.affiliateClick.count({
        where: {
          affiliateId: affiliate.id,
          clickedAt: { gte: sevenDaysAgo },
        },
      }),
      prisma.affiliateConversion.count({
        where: {
          affiliateId: affiliate.id,
          createdAt: { gte: sevenDaysAgo },
        },
      }),
    ]);

    // Recent conversions
    const recentConversions = await prisma.affiliateConversion.findMany({
      where: { affiliateId: affiliate.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        orderValue: true,
        commissionAmount: true,
        status: true,
        createdAt: true,
      },
    });

    // Calculate conversion rate
    const conversionRate = totalClicks > 0
      ? ((totalConversions / totalClicks) * 100).toFixed(2)
      : "0.00";

    const stats = {
      affiliate: {
        companyName: affiliate.companyName,
        email: affiliate.email,
        affiliateCode: affiliate.affiliateCode,
        commissionRate: affiliate.commissionRate,
        status: affiliate.status,
      },
      metrics: {
        totalClicks,
        totalConversions,
        conversionRate: `${conversionRate}%`,
        totalCommission: Number(totalCommission._sum.commissionAmount || 0),
        paidCommission: Number(paidCommission._sum.commissionAmount || 0),
        pendingCommission:
          Number(totalCommission._sum.commissionAmount || 0) -
          Number(paidCommission._sum.commissionAmount || 0),
      },
      last30Days: {
        clicks: clicksLast30Days,
        conversions: conversionsLast30Days,
        conversionRate: clicksLast30Days > 0
          ? `${((conversionsLast30Days / clicksLast30Days) * 100).toFixed(2)}%`
          : "0.00%",
      },
      last7Days: {
        clicks: clicksLast7Days,
        conversions: conversionsLast7Days,
        conversionRate: clicksLast7Days > 0
          ? `${((conversionsLast7Days / clicksLast7Days) * 100).toFixed(2)}%`
          : "0.00%",
      },
      recentConversions,
    };

    return NextResponse.json(stats);
  } catch (error) {
    return handleApiError(error, "Failed to fetch affiliate dashboard");
  }
}
