import { NextResponse } from "next/server";
import { getGeneratedQuestionsForReview } from "@/lib/question-generation";
import { checkAdminAuth } from "@/lib/auth/requireAdmin";

/**
 * GET /api/question-generation/questions
 * Get generated questions for review (Admin only)
 */
export async function GET(request: Request) {
  try {
    // Check admin authorization
    const authResult = await checkAdminAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId") || undefined;
    const status = searchParams.get("status") as any || "pending_review";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const result = await getGeneratedQuestionsForReview({
      jobId,
      status,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("Error fetching generated questions:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch questions" },
      { status: 500 }
    );
  }
}
