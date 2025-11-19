import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { updateLearningPathProgress } from "@/lib/adaptive-learning";
import { handleApiError, unauthorizedError, validationError, notFoundError } from "@/lib/api-error-handler";

/**
 * POST /api/adaptive-learning/progress
 * Update progress on a learning path node
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return unauthorizedError();
    }

    const { pathId, nodeId, status, score, timeSpent } = await request.json();

    // Validate input
    if (!pathId || !nodeId || !status) {
      return validationError("Missing required fields: pathId, nodeId, status");
    }

    if (!["not_started", "in_progress", "completed", "skipped"].includes(status)) {
      return validationError("Invalid status. Must be one of: not_started, in_progress, completed, skipped");
    }

    // Ensure user exists in database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return notFoundError("User");
    }

    // Update progress
    const progress = await updateLearningPathProgress({
      pathId,
      nodeId,
      userId: dbUser.id,
      status,
      score,
      timeSpent,
    });

    return NextResponse.json({
      success: true,
      progress,
      message: "Progress updated successfully",
    });
  } catch (error) {
    return handleApiError(error, "Failed to update progress");
  }
}
