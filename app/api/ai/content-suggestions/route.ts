import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { generateContentRecommendations } from "@/lib/ai-services";
import { handleApiError, unauthorizedError, notFoundError } from "@/lib/api-error-handler";

// GET /api/ai/content-suggestions - Get smart content recommendations
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return unauthorizedError();
    }

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId") || undefined;

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return notFoundError("User");
    }

    // Generate content recommendations
    const recommendations = await generateContentRecommendations({
      userId: dbUser.id,
      subjectId,
    });

    return NextResponse.json(recommendations);
  } catch (error) {
    return handleApiError(error, "Failed to generate content suggestions");
  }
}
