/**
 * Public API: Affiliate Registration
 * Allow partners to apply for affiliate program
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * POST /api/affiliates/register
 * Register as a new affiliate partner
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const data = await req.json();
    const {
      companyName,
      contactName,
      email,
      phone,
      website,
    } = data;

    // Validate required fields
    if (!companyName || !contactName || !email) {
      return NextResponse.json(
        { error: "Company name, contact name, and email are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await prisma.affiliate.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { 
          error: "An application with this email already exists",
          status: existing.status,
        },
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

    if (attempts >= 10) {
      return NextResponse.json(
        { error: "Failed to generate unique affiliate code. Please try again." },
        { status: 500 }
      );
    }

    // Create affiliate application with pending status
    const affiliate = await prisma.affiliate.create({
      data: {
        companyName,
        contactName,
        email,
        phone,
        website,
        affiliateCode,
        commissionRate: 10.0, // Default commission rate, admin can adjust
        status: "pending",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Your affiliate application has been submitted successfully. We will review it and contact you soon.",
      affiliate: {
        id: affiliate.id,
        companyName: affiliate.companyName,
        email: affiliate.email,
        status: affiliate.status,
        affiliateCode: affiliate.affiliateCode,
      },
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "Failed to submit affiliate application");
  }
}
