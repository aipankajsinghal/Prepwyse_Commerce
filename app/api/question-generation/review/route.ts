/**
 * Admin API: Question Review
 * Phase E: AI Learning
 * 
 * Refactored to use withAdminAuth pattern for cleaner code.
 * See REFACTORING_OPTIONS.md for details on this pattern.
 */

import { NextResponse } from "next/server";
import { reviewGeneratedQuestion, batchApproveQuestions } from "@/lib/question-generation";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

/**
 * POST /api/question-generation/review
 * Review a generated question (Admin only)
 */
export const POST = withAdminAuth(async (req, { user }) => {
  const { questionId, action, reviewNotes, batch, questionIds } = await req.json();

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
});
