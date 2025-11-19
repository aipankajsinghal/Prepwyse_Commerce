// app/api/quizzes/[quizId]/route.ts
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

    return NextResponse.json({ quiz });
  } catch (error) {
    return handleApiError(error, "Failed to fetch quiz", { quizId: (await params).quizId });
  }
}
