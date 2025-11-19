// app/api/quizzes/[quizId]/attempts/route.ts
import { NextResponse } from "next/server";
import { QuizAttemptService } from "@/lib/core/assessment/quizAttemptService";
import { requireUser } from "@/lib/auth/requireUser";
import { handleApiError } from "@/lib/api-error-handler";

export async function POST(req: Request, { params }: { params: Promise<{ quizId: string }> }) {
  try {
    const user = await requireUser(req as any);
    const { quizId } = await params;
    const attempt = await QuizAttemptService.startAttempt({ userId: user.id, quizId });
    return NextResponse.json({ attempt });
  } catch (error) {
    return handleApiError(error, "Failed to start quiz attempt");
  }
}