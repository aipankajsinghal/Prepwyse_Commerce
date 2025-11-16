import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAIProviderInfo } from "@/lib/ai-provider";

/**
 * GET /api/ai/status
 * Get information about configured AI providers
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const providerInfo = getAIProviderInfo();

    return NextResponse.json({
      success: true,
      data: providerInfo,
      message: providerInfo.totalConfigured > 0
        ? `${providerInfo.totalConfigured} AI provider(s) configured. Active: ${providerInfo.activeProvider}`
        : "No AI providers configured. Please add OPENAI_API_KEY or GEMINI_API_KEY to environment variables.",
    });
  } catch (error) {
    console.error("Error getting AI provider status:", error);
    return NextResponse.json(
      { error: "Failed to get AI provider status" },
      { status: 500 }
    );
  }
}
