/**
 * Admin API: Generated Questions Review
 * Phase E: AI Learning
 * 
 * Refactored to use withAdminAuth pattern for cleaner code.
 * See REFACTORING_OPTIONS.md for details on this pattern.
 */

import { NextResponse } from "next/server";
import { getGeneratedQuestionsForReview } from "@/lib/question-generation";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

/**
 * GET /api/question-generation/questions
 * Get generated questions for review (Admin only)
 */
export const GET = withAdminAuth(async (req, { user }) => {
  const { searchParams } = new URL(req.url);
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
});
