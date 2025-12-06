import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { generatePersonalizedRecommendations } from "@/lib/ai-services";
import { handleApiError, unauthorizedError, notFoundError } from "@/lib/api-error-handler";
import { withRedisRateLimit, aiRateLimit } from "@/lib/middleware/redis-rateLimit";

// GET /api/ai/recommendations - Get personalized recommendations
async function getHandler(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return unauthorizedError();
    }

    // Get or create user in database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return notFoundError("User");
    }

    // Generate AI recommendations
    const aiRecommendations = await generatePersonalizedRecommendations(dbUser.id);

    // Update user profile with AI insights
    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        weakAreas: aiRecommendations.weakAreas,
        strongAreas: aiRecommendations.strongAreas,
        preferredDifficulty: aiRecommendations.suggestedDifficulty,
        lastRecommendation: new Date(),
      },
    });

    // Store recommendations in database
    const storedRecommendations = await Promise.all(
      aiRecommendations.recommendations.map(async (rec: any) => {
        return await prisma.recommendation.create({
          data: {
            userId: dbUser.id,
            type: rec.type,
            title: rec.title,
            description: rec.description,
            content: rec.actionItems || [],
            priority: rec.priority || 5,
          },
        });
      })
    );

    return NextResponse.json({
      recommendations: storedRecommendations,
      insights: {
        weakAreas: aiRecommendations.weakAreas,
        strongAreas: aiRecommendations.strongAreas,
        suggestedDifficulty: aiRecommendations.suggestedDifficulty,
      },
    });
  } catch (error) {
    return handleApiError(error, "Failed to generate recommendations");
  }
}

// POST /api/ai/recommendations/mark-read - Mark recommendation as read
async function postHandler(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return unauthorizedError();
    }

    const { recommendationId } = await request.json();

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return notFoundError("User");
    }

    await prisma.recommendation.update({
      where: {
        id: recommendationId,
        userId: dbUser.id,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, "Failed to update recommendation");
  }
}

// Apply rate limiting: 5 requests per hour
export const GET = withRedisRateLimit(getHandler, aiRateLimit);
export const POST = withRedisRateLimit(postHandler, aiRateLimit);
