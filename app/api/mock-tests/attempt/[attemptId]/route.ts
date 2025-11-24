import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, unauthorizedError, notFoundError } from "@/lib/api-error-handler";

// GET /api/mock-tests/attempt/[attemptId] - Get mock test attempt details with questions
export async function GET(
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
      include: {
        mockTest: true,
      },
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

    // Get questions for this mock test
    const questions = await prisma.mockTestQuestion.findMany({
      where: { mockTestId: attempt.mockTestId },
      orderBy: { questionNumber: "asc" },
    });

    return NextResponse.json({
      attempt,
      mockTest: attempt.mockTest,
      questions,
      existingAnswers: attempt.answers,
    });
  } catch (error) {
    return handleApiError(error, "Failed to fetch mock test attempt");
  }
}
