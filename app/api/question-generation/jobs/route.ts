import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getQuestionGenerationJobs } from "@/lib/question-generation";

/**
 * GET /api/question-generation/jobs
 * Get question generation jobs (Admin only)
 */
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Add admin role check

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const result = await getQuestionGenerationJobs({
      adminId: userId, // Filter by current admin
      status,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("Error fetching question generation jobs:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
