// app/api/attempts/[attemptId]/submit/route.ts
import { NextResponse } from "next/server";
import { QuizAttemptService } from "@/lib/core/assessment/quizAttemptService";
import { requireUser } from "@/lib/auth/requireUser";
import { handleApiError } from "@/lib/api-error-handler";

export async function POST(req: Request, { params }: { params: Promise<{ attemptId: string }> }) {
  try {
    const user = await requireUser(req as any);
    const { attemptId } = await params;
    const attempt = await QuizAttemptService.submitAttempt({ userId: user.id, attemptId });
    return NextResponse.json({ attempt });
  } catch (error) {
    return handleApiError(error, "Failed to submit attempt");
  }
}