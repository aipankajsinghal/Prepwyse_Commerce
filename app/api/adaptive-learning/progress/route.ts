import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { updateLearningPathProgress } from "@/lib/adaptive-learning";

/**
 * POST /api/adaptive-learning/progress
 * Update progress on a learning path node
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pathId, nodeId, status, score, timeSpent } = await request.json();

    // Validate input
    if (!pathId || !nodeId || !status) {
      return NextResponse.json(
        { error: "Missing required fields: pathId, nodeId, status" },
        { status: 400 }
      );
    }

    if (!["not_started", "in_progress", "completed", "skipped"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: not_started, in_progress, completed, skipped" },
        { status: 400 }
      );
    }

    // Ensure user exists in database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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
  } catch (error: any) {
    console.error("Error updating learning path progress:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update progress" },
      { status: 500 }
    );
  }
}
