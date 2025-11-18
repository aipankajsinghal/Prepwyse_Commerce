import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getUserLearningPaths } from "@/lib/adaptive-learning";

/**
 * GET /api/adaptive-learning/paths
 * Get user's learning paths
 */
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure user exists in database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return NextResponse.json({ paths: [] });
    }

    // Get learning paths
    const paths = await getUserLearningPaths(dbUser.id);

    return NextResponse.json({
      success: true,
      paths,
    });
  } catch (error: any) {
    console.error("Error fetching learning paths:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch learning paths" },
      { status: 500 }
    );
  }
}
