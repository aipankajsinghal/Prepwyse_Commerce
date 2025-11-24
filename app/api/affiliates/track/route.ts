/**
 * Public API: Affiliate Click Tracking
 * Track clicks from affiliate links
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * POST /api/affiliates/track
 * Track affiliate click/visit
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const data = await req.json();
    const { affiliateCode, referrerUrl, landingPage, utmSource, utmMedium, utmCampaign } = data;

    if (!affiliateCode) {
      return NextResponse.json(
        { error: "Affiliate code is required" },
        { status: 400 }
      );
    }

    // Find affiliate
    const affiliate = await prisma.affiliate.findUnique({
      where: { affiliateCode },
    });

    if (!affiliate) {
      return NextResponse.json(
        { error: "Invalid affiliate code" },
        { status: 404 }
      );
    }

    // Only track for approved affiliates
    if (affiliate.status !== "approved") {
      return NextResponse.json(
        { error: "Affiliate is not active" },
        { status: 403 }
      );
    }

    // Extract tracking information from request
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Create click record
    await prisma.affiliateClick.create({
      data: {
        affiliateId: affiliate.id,
        ipAddress,
        userAgent,
        referrerUrl,
        landingPage,
        utmSource,
        utmMedium,
        utmCampaign,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Click tracked successfully",
    });
  } catch (error) {
    return handleApiError(error, "Failed to track affiliate click");
  }
}
