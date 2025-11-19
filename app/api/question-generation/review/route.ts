import { NextResponse } from "next/server";
import { reviewGeneratedQuestion, batchApproveQuestions } from "@/lib/question-generation";
import { checkAdminAuth } from "@/lib/auth/requireAdmin";

/**
 * POST /api/question-generation/review
 * Review a generated question (Admin only)
 */
export async function POST(request: Request) {
  try {
    // Check admin authorization
    const authResult = await checkAdminAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { user } = authResult;

    const { questionId, action, reviewNotes, batch, questionIds } = await request.json();

    // Handle batch approval
    if (batch && questionIds && Array.isArray(questionIds)) {
      const result = await batchApproveQuestions({
        questionIds,
        adminId: user.clerkId,
      });

      return NextResponse.json({
        ...result,
        message: `Batch approved ${result.approved} out of ${result.total} questions`,
      });
    }

    // Validate single question review
    if (!questionId || !action) {
      return NextResponse.json(
        { error: "Missing required fields: questionId, action" },
        { status: 400 }
      );
    }

    if (!["approve", "reject", "needs_revision"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be one of: approve, reject, needs_revision" },
        { status: 400 }
      );
    }

    // Review question
    const result = await reviewGeneratedQuestion({
      questionId,
      adminId: user.clerkId,
      action,
      reviewNotes,
    });

    return NextResponse.json({
      ...result,
      message: `Question ${action}d successfully`,
    });
  } catch (error: any) {
    console.error("Error reviewing question:", error);
    return NextResponse.json(
      { error: error.message || "Failed to review question" },
      { status: 500 }
    );
  }
}
