import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { recommendNextAction } from "@/lib/adaptive-learning";
import { handleApiError, unauthorizedError, validationError, notFoundError } from "@/lib/api-error-handler";

/**
 * GET /api/adaptive-learning/next-action?pathId=xxx
 * Get recommended next action in learning path
 */
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return unauthorizedError();
    }

    const { searchParams } = new URL(request.url);
    const pathId = searchParams.get("pathId");

    if (!pathId) {
      return validationError("Missing required parameter: pathId");
    }

    // Ensure user exists in database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return notFoundError("User");
    }

    // Get next recommended action
    const recommendation = await recommendNextAction(dbUser.id, pathId);

    return NextResponse.json({
      success: true,
      recommendation,
    });
  } catch (error) {
    return handleApiError(error, "Failed to get next action");
  }
}
