import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, unauthorizedError, notFoundError } from "@/lib/api-error-handler";

// POST /api/mock-tests/attempt/[attemptId]/answer - Save answer for a question
export async function POST(
  request: Request,
  context: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return unauthorizedError();
    }

    const params = await context.params;
    const attemptId = params.attemptId;
    const { questionId, selectedAnswer, markedForReview } = await request.json();

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return notFoundError("User");
    }

    // Get mock test attempt
    const attempt = await prisma.mockTestAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) {
      return notFoundError("Mock test attempt");
    }

    // Verify the attempt belongs to the user
    if (attempt.userId !== dbUser.id) {
      return NextResponse.json(
        { error: "Unauthorized access to this mock test attempt" },
        { status: 403 }
      );
    }

    // Update answers array
    const answers = (attempt.answers as any[]) || [];
    const answerIndex = answers.findIndex((a: any) => a.questionId === questionId);

    const newAnswer = {
      questionId,
      selectedAnswer,
      markedForReview: markedForReview || false,
      answeredAt: new Date().toISOString(),
    };

    if (answerIndex >= 0) {
      answers[answerIndex] = newAnswer;
    } else {
      answers.push(newAnswer);
    }

    // Update attempt with new answers
    await prisma.mockTestAttempt.update({
      where: { id: attemptId },
      data: { answers },
    });

    return NextResponse.json({
      success: true,
      message: "Answer saved successfully",
    });
  } catch (error) {
    return handleApiError(error, "Failed to save answer");
  }
}
