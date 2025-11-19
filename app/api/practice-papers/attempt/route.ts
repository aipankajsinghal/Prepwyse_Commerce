import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, unauthorizedError, notFoundError, validationError } from "@/lib/api-error-handler";

// POST /api/practice-papers/attempt - Start a new practice paper attempt
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return unauthorizedError();

    const { paperId } = await request.json();

    if (!paperId) return validationError("Paper ID is required");

    // Get paper details
    const paper = await prisma.practicePaper.findUnique({
      where: { id: paperId },
    });

    if (!paper) return notFoundError("Practice paper not found");

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) return notFoundError("User not found");

    // Parse questions to get count
    const questions = paper.questions as any[];
    const totalQuestions = Array.isArray(questions) ? questions.length : 0;

    // Create attempt
    const attempt = await prisma.practicePaperAttempt.create({
      data: {
        userId: user.id,
        paperId: paper.id,
        totalQuestions,
        totalMarks: paper.totalMarks,
        answers: [],
      },
    });

    return NextResponse.json({ attempt, paper }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "Failed to start practice paper attempt");
  }
}
