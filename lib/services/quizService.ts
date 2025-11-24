/**
 * Quiz Service
 * 
 * Centralizes all quiz-related database operations.
 * Handles quiz CRUD, attempts, scoring, and statistics.
 */

import { prisma } from "@/lib/prisma";
import { Quiz, QuizAttempt, Question, Prisma } from "@prisma/client";

/**
 * Business logic constants
 * Can be configured per environment or subscription tier
 */
const QUIZ_LIMITS = {
  FREE_TIER_DAILY_LIMIT: 5,
  // Future: can add PREMIUM_TIER_DAILY_LIMIT, etc.
};

/**
 * Create a new quiz
 */
export async function createQuiz(
  data: Prisma.QuizCreateInput
): Promise<Quiz> {
  return await prisma.quiz.create({
    data,
  });
}

/**
 * Get quiz by ID
 */
export async function getQuizById(id: string): Promise<Quiz | null> {
  return await prisma.quiz.findUnique({
    where: { id },
    include: {
      attempts: true,
    },
  });
}

/**
 * Get all quizzes with optional filters and pagination
 */
export async function getQuizzes(filters?: {
  subjectId?: string;
  skip?: number;
  take?: number;
}) {
  const skip = filters?.skip ?? 0;
  const take = filters?.take ?? 20; // Default page size

  return await prisma.quiz.findMany({
    where: {
      ...(filters?.subjectId && { subjectId: filters.subjectId }),
    },
    include: {
      attempts: {
        select: {
          id: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });
}

/**
 * Update quiz
 */
export async function updateQuiz(
  id: string,
  data: Prisma.QuizUpdateInput
): Promise<Quiz> {
  return await prisma.quiz.update({
    where: { id },
    data,
  });
}

/**
 * Delete quiz
 */
export async function deleteQuiz(id: string): Promise<void> {
  await prisma.quiz.delete({
    where: { id },
  });
}

/**
 * Get questions for chapters in quiz
 * Note: Quiz stores chapterIds in Json field, so this needs to be parsed
 */
export async function getQuizQuestions(chapterIds: string[]): Promise<Question[]> {
  return await prisma.question.findMany({
    where: {
      chapterId: {
        in: chapterIds,
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Create a quiz attempt
 */
export async function createQuizAttempt(
  userId: string,
  quizId: string,
  totalQuestions: number
): Promise<QuizAttempt> {
  return await prisma.quizAttempt.create({
    data: {
      userId,
      quizId,
      answers: [],
      score: 0,
      totalQuestions,
      status: "IN_PROGRESS",
    },
  });
}

/**
 * Get quiz attempt by ID
 */
export async function getQuizAttempt(attemptId: string) {
  return await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: true,
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

/**
 * Quiz Answer type
 */
export interface QuizAnswer {
  questionId: string;
  selectedAnswer: string;
  markedForReview?: boolean;
  answeredAt?: string;
}

/**
 * Update quiz attempt progress
 */
export async function updateQuizAttemptProgress(
  attemptId: string,
  answers: QuizAnswer[]
): Promise<QuizAttempt> {
  return await prisma.quizAttempt.update({
    where: { id: attemptId },
    data: {
      answers: answers as unknown as Prisma.InputJsonValue,
    },
  });
}

/**
 * Submit and score quiz attempt
 * Note: Scoring logic should be implemented based on your specific requirements
 * This is a simplified version
 */
export async function submitQuizAttempt(
  attemptId: string,
  answers: any[],
  score: number
): Promise<QuizAttempt> {
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
  });

  if (!attempt) {
    throw new Error("Quiz attempt not found");
  }

  if (attempt.status === "COMPLETED") {
    throw new Error("Quiz attempt already completed");
  }

  // Update attempt with final score
  return await prisma.quizAttempt.update({
    where: { id: attemptId },
    data: {
      answers: answers as any,
      score,
      status: "COMPLETED",
      completedAt: new Date(),
    },
  });
}

/**
 * Get user's quiz attempts
 */
export async function getUserQuizAttempts(
  userId: string,
  quizId?: string
) {
  return await prisma.quizAttempt.findMany({
    where: {
      userId,
      ...(quizId && { quizId }),
    },
    include: {
      quiz: {
        select: {
          title: true,
          description: true,
        },
      },
    },
    orderBy: { startedAt: "desc" },
  });
}

/**
 * Get quiz statistics
 */
export async function getQuizStatistics(quizId: string) {
  const attempts = await prisma.quizAttempt.findMany({
    where: { quizId, status: "COMPLETED" },
  });

  const totalAttempts = attempts.length;
  const averageScore = attempts.length > 0
    ? attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length
    : 0;

  const highestScore = attempts.length > 0
    ? Math.max(...attempts.map((a) => a.score))
    : 0;

  const lowestScore = attempts.length > 0
    ? Math.min(...attempts.map((a) => a.score))
    : 0;

  return {
    totalAttempts,
    averageScore: Math.round(averageScore * 100) / 100,
    highestScore,
    lowestScore,
  };
}

/**
 * Get recent quiz attempts for a user (for adaptive learning)
 */
export async function getRecentQuizAttempts(
  userId: string,
  limit: number = 10
) {
  return await prisma.quizAttempt.findMany({
    where: {
      userId,
      status: "COMPLETED",
    },
    include: {
      quiz: {
        select: {
          title: true,
          subjectId: true,
        },
      },
    },
    orderBy: { completedAt: "desc" },
    take: limit,
  });
}

/**
 * Check if user can attempt quiz (based on subscription or trial limits)
 */
export async function canUserAttemptQuiz(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return false;
  }

  // Get recent attempts
  const attemptsToday = await prisma.quizAttempt.count({
    where: {
      userId,
      startedAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      },
    },
  });

  // Simple check: For now, allow if user is a student (expand with subscription logic later)
  // For free users, limit to daily quota
  return attemptsToday < QUIZ_LIMITS.FREE_TIER_DAILY_LIMIT;
}
