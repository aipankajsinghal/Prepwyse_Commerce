import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, unauthorizedError, notFoundError } from "@/lib/api-error-handler";
import { logger } from "@/lib/logger";

/**
 * Export user data (GDPR/DPDP compliance)
 * GET /api/user/data/export
 */
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return unauthorizedError();
    }

    const clerkUser = await currentUser();
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return notFoundError("User");
    }

    // Gather all user data
    const quizAttempts = await prisma.quizAttempt.findMany({
      where: { userId: user.id },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            description: true,
            questionCount: true,
            duration: true,
            createdAt: true,
          },
        },
      },
    });

    // Compile comprehensive data export
    const exportData = {
      exportDate: new Date().toISOString(),
      exportVersion: "1.0",
      user: {
        id: user.id,
        clerkId: user.clerkId,
        email: clerkUser?.emailAddresses?.[0]?.emailAddress || user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      statistics: {
        totalQuizzesTaken: new Set(quizAttempts.map((a) => a.quizId)).size,
        totalAttempts: quizAttempts.length,
        completedAttempts: quizAttempts.filter((a) => a.status === "COMPLETED").length,
      },
      quizzes: Array.from(new Set(quizAttempts.map((a) => a.quiz))).map((q) => ({
        id: q.id,
        title: q.title,
        description: q.description,
        questionCount: q.questionCount,
        duration: q.duration,
        createdAt: q.createdAt,
      })),
      quizAttempts: quizAttempts.map((attempt) => ({
        id: attempt.id,
        quizTitle: attempt.quiz.title,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        status: attempt.status,
        startedAt: attempt.startedAt,
        completedAt: attempt.completedAt,
        timeSpent: attempt.timeSpent,
        answers: attempt.answers,
      })),
      privacy: {
        note: "This export contains all personal data we have stored about you.",
        rights: "You have the right to request corrections, deletions, or restrictions on processing.",
        contact: "For questions, contact: privacy@prepwyse.com",
      },
    };

    logger.compliance("User data export", { userId: user.id, clerkId: userId });

    // Return as JSON for download
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="prepwyse-data-export-${userId}-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    return handleApiError(error, "Failed to export data");
  }
}
