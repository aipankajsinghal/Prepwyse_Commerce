import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-error-handler";
import { requireUser } from "@/lib/auth/requireUser";

// POST /api/quiz - Create and start a new quiz
export async function POST(request: Request) {
  try {
    const dbUser = await requireUser(request);

    const { title, description, subjectId, chapterIds, questionCount, duration } =
      await request.json();

    // Create quiz
    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        subjectId,
        chapterIds,
        questionCount,
        duration,
      },
    });

    // Fetch random questions from selected chapters
    const questions = await prisma.question.findMany({
      where: {
        chapterId: {
          in: chapterIds,
        },
      },
      take: questionCount,
    });

    // Create quiz attempt
    const quizAttempt = await prisma.quizAttempt.create({
      data: {
        userId: dbUser.id,
        quizId: quiz.id,
        totalQuestions: questions.length,
        answers: [],
      },
    });

    return NextResponse.json({
      quizId: quiz.id,
      quizAttempt,
      questions,
    });
  } catch (error) {
    return handleApiError(error, "Failed to create quiz");
  }
}
