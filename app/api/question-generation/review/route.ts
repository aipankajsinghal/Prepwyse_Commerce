import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { reviewGeneratedQuestion, batchApproveQuestions } from "@/lib/question-generation";

/**
 * POST /api/question-generation/review
 * Review a generated question (Admin only)
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Add admin role check

    const { questionId, action, reviewNotes, batch, questionIds } = await request.json();

    // Handle batch approval
    if (batch && questionIds && Array.isArray(questionIds)) {
      const result = await batchApproveQuestions({
        questionIds,
        adminId: userId,
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
      adminId: userId,
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
