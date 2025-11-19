/**
 * Admin API: Question Generation Jobs
 * Phase E: AI Learning
 * 
 * Refactored to use withAdminAuth pattern for cleaner code.
 * See REFACTORING_OPTIONS.md for details on this pattern.
 */

import { NextResponse } from "next/server";
import { getQuestionGenerationJobs } from "@/lib/question-generation";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

/**
 * GET /api/question-generation/jobs
 * Get question generation jobs (Admin only)
 */
export const GET = withAdminAuth(async (req, { user }) => {
  const { searchParams } = new URL(req.url);
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
});
