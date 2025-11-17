// app/api/attempts/[attemptId]/submit/route.ts
import { NextResponse } from "next/server";
import { QuizAttemptService } from "@/lib/core/assessment/quizAttemptService";
import { requireUser } from "@/lib/auth/requireUser";

export async function POST(req: Request, { params }: { params: Promise<{ attemptId: string }> }) {
  const user = await requireUser(req as any);
  const { attemptId } = await params;
  const attempt = await QuizAttemptService.submitAttempt({ userId: user.id, attemptId });
  return NextResponse.json({ attempt });
}