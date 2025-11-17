// app/api/attempts/[attemptId]/submit/route.ts
import { NextResponse } from "next/server";
import { QuizAttemptService } from "@/lib/core/assessment/quizAttemptService";
import { requireUser } from "@/lib/auth/requireUser";

export async function POST(req: Request, { params }: { params: { attemptId: string } }) {
  const user = await requireUser(req as any);
  const attempt = await QuizAttemptService.submitAttempt({ userId: user.id, attemptId: params.attemptId });
  return NextResponse.json({ attempt });
}