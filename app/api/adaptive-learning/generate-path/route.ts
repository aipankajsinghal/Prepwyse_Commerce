import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAdaptiveLearningPath } from "@/lib/adaptive-learning";
import { handleApiError, validationError } from "@/lib/api-error-handler";
import { requireUser } from "@/lib/auth/requireUser";

/**
 * POST /api/adaptive-learning/generate-path
 * Generate a personalized adaptive learning path for the user
 */
export async function POST(request: Request) {
  try {
    const dbUser = await requireUser(request);

    const { subjectId, goalType, targetDate, weeklyHours } = await request.json();

    // Validate input
    if (!goalType || !["exam_prep", "chapter_mastery", "skill_improvement"].includes(goalType)) {
      return validationError("Invalid goal type. Must be one of: exam_prep, chapter_mastery, skill_improvement");
    }

    // Generate adaptive learning path
    const learningPath = await generateAdaptiveLearningPath({
      userId: dbUser.id,
      subjectId,
      goalType,
      targetDate: targetDate ? new Date(targetDate) : undefined,
      weeklyHours,
    });

    return NextResponse.json({
      success: true,
      learningPath,
      message: "Adaptive learning path generated successfully",
    });
  } catch (error) {
    return handleApiError(error, "Failed to generate learning path");
  }
}
