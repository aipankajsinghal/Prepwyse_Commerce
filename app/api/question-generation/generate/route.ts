/**
 * Admin API: Question Generation
 * Phase E: AI Learning
 * 
 * Refactored to use withAdminAuth pattern for cleaner code.
 * See REFACTORING_OPTIONS.md for details on this pattern.
 */

import { NextResponse } from "next/server";
import { startQuestionGenerationJob } from "@/lib/question-generation";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

/**
 * POST /api/question-generation/generate
 * Start a new question generation job (Admin only)
 */
export const POST = withAdminAuth(async (req, { user }) => {
  const { subjectId, chapterIds, questionCount, difficulty, sourceContent, sourceType } =
    await req.json();

    // Validate input
    if (!chapterIds || !Array.isArray(chapterIds) || chapterIds.length === 0) {
      return NextResponse.json(
        { error: "At least one chapter must be selected" },
        { status: 400 }
      );
    }

    if (!questionCount || questionCount < 1 || questionCount > 100) {
      return NextResponse.json(
        { error: "Question count must be between 1 and 100" },
        { status: 400 }
      );
    }

    if (!sourceType || !["ai", "upload", "manual"].includes(sourceType)) {
      return NextResponse.json(
        { error: "Invalid source type. Must be one of: ai, upload, manual" },
        { status: 400 }
      );
    }

    // Start generation job
    const job = await startQuestionGenerationJob({
      adminId: user.clerkId,
      adminName: user.name || "Admin",
      subjectId,
      chapterIds,
      questionCount,
      difficulty,
      sourceContent,
      sourceType,
    });

  return NextResponse.json({
    success: true,
    job,
    message: "Question generation job started successfully",
  });
});
