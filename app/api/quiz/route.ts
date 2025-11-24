import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-error-handler";
import { requireUser } from "@/lib/auth/requireUser";
import { validateRequestBody } from "@/lib/utils/validateRequest";
import { z } from "zod";

// Validation schema for quiz creation
const createQuizRequestSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().max(1000).optional(),
  subjectId: z.string().min(1, "Subject ID is required").optional(),
  chapterIds: z.array(z.string().min(1)).min(1, "At least one chapter is required"),
  questionCount: z.number().int().min(1, "Question count must be at least 1").max(100, "Question count cannot exceed 100"),
  duration: z.number().int().min(1, "Duration must be at least 1 minute").max(300, "Duration cannot exceed 300 minutes"),
});

// POST /api/quiz - Create and start a new quiz
export async function POST(request: Request) {
  try {
    const dbUser = await requireUser(request);

    // Validate request body
    const validated = await validateRequestBody(request.clone(), createQuizRequestSchema);
    if (validated instanceof NextResponse) {
      return validated;
    }

    const { title, description, subjectId, chapterIds, questionCount, duration } = validated;

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
    // First, get all matching question IDs
    const allQuestions = await prisma.question.findMany({
      where: {
        chapterId: {
          in: chapterIds,
        },
      },
      select: { id: true },
    });

    // Shuffle the array to randomize
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    const selectedIds = shuffled.slice(0, Math.min(questionCount, shuffled.length)).map(q => q.id);

    // Fetch full question details for selected IDs
    const questions = await prisma.question.findMany({
      where: {
        id: {
          in: selectedIds,
        },
      },
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
