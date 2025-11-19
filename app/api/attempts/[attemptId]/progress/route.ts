// app/api/attempts/[attemptId]/progress/route.ts
import { NextResponse } from "next/server";
import { QuizAttemptService } from "@/lib/core/assessment/quizAttemptService";
import { requireUser } from "@/lib/auth/requireUser";
import { handleApiError } from "@/lib/api-error-handler";

export async function PATCH(req: Request, { params }: { params: Promise<{ attemptId: string }> }) {
  try {
    const user = await requireUser(req as any);
    const body = await req.json();
    const { attemptId } = await params;
    const attempt = await QuizAttemptService.updateProgress({ userId: user.id, attemptId, currentQuestionIndex: body.currentQuestionIndex, timeRemaining: body.timeRemaining, answers: body.answers });
    return NextResponse.json({ attempt });
  } catch (error) {
    return handleApiError(error, "Failed to update attempt progress");
  }
}