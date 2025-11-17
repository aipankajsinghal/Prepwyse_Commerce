// app/api/quizzes/[quizId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/requireUser";

export async function GET(req: Request, { params }: { params: Promise<{ quizId: string }> }) {
  try {
    await requireUser(req as any);
    const { quizId } = await params;
    
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ quiz });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch quiz" },
      { status: 500 }
    );
  }
}
