import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { generateQuestionExplanation } from "@/lib/ai-services";
import { handleApiError, unauthorizedError, notFoundError } from "@/lib/api-error-handler";

// POST /api/ai/explain - Generate AI explanation for a question
export async function POST(request: Request) {
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
