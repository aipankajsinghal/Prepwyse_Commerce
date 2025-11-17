// app/api/quizzes/[quizId]/attempts/route.ts
import { NextResponse } from "next/server";
import { QuizAttemptService } from "@/lib/core/assessment/quizAttemptService";
import { requireUser } from "@/lib/auth/requireUser";

export async function POST(req: Request, { params }: { params: Promise<{ quizId: string }> }) {
  const user = await requireUser(req as any);
  const { quizId } = await params;
  const attempt = await QuizAttemptService.startAttempt({ userId: user.id, quizId });
  return NextResponse.json({ attempt });
}