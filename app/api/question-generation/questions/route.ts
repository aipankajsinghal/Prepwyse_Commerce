import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getGeneratedQuestionsForReview } from "@/lib/question-generation";

/**
 * GET /api/question-generation/questions
 * Get generated questions for review (Admin only)
 */
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Add admin role check

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
