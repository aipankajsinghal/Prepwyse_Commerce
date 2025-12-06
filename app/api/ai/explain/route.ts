import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { generateQuestionExplanation } from "@/lib/ai-services";
import { handleApiError, unauthorizedError, notFoundError } from "@/lib/api-error-handler";
import { withRedisRateLimit, aiRateLimit } from "@/lib/middleware/redis-rateLimit";

// POST /api/ai/explain - Generate AI explanation for a question
async function handler(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return unauthorizedError();
    }

    const { questionId, userAnswer } = await request.json();

    // Get question details
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        chapter: {
          include: {
            subject: true,
          },
        },
      },
    });

    if (!question) {
      return notFoundError("Question");
    }

    // Generate AI explanation
    const explanation = await generateQuestionExplanation({
      questionText: question.questionText,
      options: question.options as string[],
      correctAnswer: question.correctAnswer,
      userAnswer,
      subject: question.chapter.subject.name,
      chapter: question.chapter.name,
    });

    return NextResponse.json({
      explanation,
      correctAnswer: question.correctAnswer,
      isCorrect: userAnswer === question.correctAnswer,
    });
  } catch (error) {
    return handleApiError(error, "Failed to generate explanation", { questionId: request.url });
  }
}

// Apply rate limiting: 5 requests per hour
export const POST = withRedisRateLimit(handler, aiRateLimit);
