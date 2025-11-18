import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { generateAdaptiveLearningPath } from "@/lib/adaptive-learning";

/**
 * POST /api/adaptive-learning/generate-path
 * Generate a personalized adaptive learning path for the user
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subjectId, goalType, targetDate, weeklyHours } = await request.json();

    // Validate input
    if (!goalType || !["exam_prep", "chapter_mastery", "skill_improvement"].includes(goalType)) {
      return NextResponse.json(
        { error: "Invalid goal type. Must be one of: exam_prep, chapter_mastery, skill_improvement" },
        { status: 400 }
      );
    }

    // Ensure user exists in database
    const dbUser = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: {
        clerkId: userId,
        email: "", // Will be updated by user sync
      },
    });

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
  } catch (error: any) {
    console.error("Error generating adaptive learning path:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate learning path" },
      { status: 500 }
    );
  }
}
