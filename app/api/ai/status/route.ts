import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAIProviderInfo } from "@/lib/ai-provider";
import { handleApiError, unauthorizedError } from "@/lib/api-error-handler";

/**
 * GET /api/ai/status
 * Get information about configured AI providers
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) return unauthorizedError();

    const providerInfo = getAIProviderInfo();

    return NextResponse.json({
      success: true,
      data: providerInfo,
      message: providerInfo.totalConfigured > 0
        ? `${providerInfo.totalConfigured} AI provider(s) configured. Active: ${providerInfo.activeProvider}`
        : "No AI providers configured. Please add OPENAI_API_KEY or GEMINI_API_KEY to environment variables.",
    });
  } catch (error) {
    return handleApiError(error, "Failed to get AI provider status");
  }
}
