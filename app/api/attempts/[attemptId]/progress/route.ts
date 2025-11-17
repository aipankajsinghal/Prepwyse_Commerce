// app/api/attempts/[attemptId]/progress/route.ts
import { NextResponse } from "next/server";
import { QuizAttemptService } from "@/lib/core/assessment/quizAttemptService";
import { requireUser } from "@/lib/auth/requireUser";

export async function PATCH(req: Request, { params }: { params: { attemptId: string } }) {
  const user = await requireUser(req as any);
  const body = await req.json();
  const attempt = await QuizAttemptService.updateProgress({ userId: user.id, attemptId: params.attemptId, currentQuestionIndex: body.currentQuestionIndex, timeRemaining: body.timeRemaining, answers: body.answers });
  return NextResponse.json({ attempt });
}