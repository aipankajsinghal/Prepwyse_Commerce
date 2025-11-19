import { NextResponse } from "next/server";
import { getQuestionGenerationJobs } from "@/lib/question-generation";
import { checkAdminAuth } from "@/lib/auth/requireAdmin";

/**
 * GET /api/question-generation/jobs
 * Get question generation jobs (Admin only)
 */
export async function GET(request: Request) {
  try {
    // Check admin authorization
    const authResult = await checkAdminAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { user } = authResult;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const result = await getQuestionGenerationJobs({
      adminId: user.clerkId, // Filter by current admin
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
