import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, unauthorizedError, notFoundError } from "@/lib/api-error-handler";

// POST /api/mock-tests/attempt/[attemptId]/submit - Submit mock test attempt
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
    const { answers, timeSpent } = await request.json();

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

    // Check if already completed
    if (attempt.completedAt) {
      return NextResponse.json(
        { error: "Mock test has already been submitted" },
        { status: 400 }
      );
    }

    // Get all questions for this mock test
    const questions = await prisma.mockTestQuestion.findMany({
      where: { mockTestId: attempt.mockTestId },
    });

    // Calculate score
    let score = 0;
    const sectionScores: Record<string, { correct: number; total: number }> = {};

    questions.forEach((question) => {
      const answer = answers.find((a: any) => a.questionId === question.id);
      
      // Initialize section score if not exists
      if (!sectionScores[question.section]) {
        sectionScores[question.section] = { correct: 0, total: 0 };
      }
      sectionScores[question.section].total++;

      if (answer && answer.selectedAnswer === question.correctAnswer) {
        score++;
        sectionScores[question.section].correct++;
      }
    });

    // Update attempt with final results
    const updatedAttempt = await prisma.mockTestAttempt.update({
      where: { id: attemptId },
      data: {
        answers,
        score,
        sectionScores,
        timeSpent,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Mock test submitted successfully",
      score,
      totalQuestions: questions.length,
      sectionScores,
      attemptId: updatedAttempt.id,
    });
  } catch (error) {
    return handleApiError(error, "Failed to submit mock test");
  }
}
