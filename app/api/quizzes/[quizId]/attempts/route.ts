// app/api/quizzes/[quizId]/attempts/route.ts
import { NextResponse } from "next/server";
import { QuizAttemptService } from "@/lib/core/assessment/quizAttemptService";
import { requireUser } from "@/lib/auth/requireUser";

export async function POST(req: Request, { params }: { params: { quizId: string } }) {
  const user = await requireUser(req as any);
  const attempt = await QuizAttemptService.startAttempt({ userId: user.id, quizId: params.quizId });
  return NextResponse.json({ attempt });
}