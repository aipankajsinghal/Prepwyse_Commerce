import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { recommendNextAction } from "@/lib/adaptive-learning";

/**
 * GET /api/adaptive-learning/next-action?pathId=xxx
 * Get recommended next action in learning path
 */
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pathId = searchParams.get("pathId");

    if (!pathId) {
      return NextResponse.json(
        { error: "Missing required parameter: pathId" },
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

    // Get next recommended action
    const recommendation = await recommendNextAction(dbUser.id, pathId);

    return NextResponse.json({
      success: true,
      recommendation,
    });
  } catch (error: any) {
    console.error("Error getting next action:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get next action" },
      { status: 500 }
    );
  }
}
