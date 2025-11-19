// app/api/quizzes/[quizId]/questions/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/requireUser";
import { handleApiError, notFoundError } from "@/lib/api-error-handler";

export async function GET(req: Request, { params }: { params: Promise<{ quizId: string }> }) {
  try {
    await requireUser(req as any);
    const { quizId } = await params;
    
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      return notFoundError("Quiz");
    }

    // Get chapter IDs from the quiz
    const chapterIds = (quiz.chapterIds as string[]) ?? [];
    
    // Fetch questions from those chapters
    const questions = await prisma.question.findMany({
      where: {
        chapterId: { in: chapterIds },
      },
      orderBy: { createdAt: "asc" },
      take: quiz.questionCount,
      select: {
        id: true,
        questionText: true,
        options: true,
        chapterId: true,
        // Don't send correctAnswer or explanation to client during quiz
      },
    });

    return NextResponse.json({ questions });
  } catch (error) {
    return handleApiError(error, "Failed to fetch questions", { quizId: (await params).quizId });
  }
}
