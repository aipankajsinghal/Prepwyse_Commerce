/**
 * Quiz Service
 * 
 * Centralizes all quiz-related database operations.
 * Handles quiz CRUD, attempts, scoring, and statistics.
 */

import { prisma } from "@/lib/prisma";
import { Quiz, QuizAttempt, Question, Prisma } from "@prisma/client";

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
      questions: true,
      subject: true,
    },
  });
}

/**
 * Get all quizzes with optional filters
 */
export async function getQuizzes(filters?: {
  subjectId?: string;
  difficulty?: string;
  userId?: string;
}) {
  return await prisma.quiz.findMany({
    where: {
      ...(filters?.subjectId && { subjectId: filters.subjectId }),
      ...(filters?.difficulty && { difficulty: filters.difficulty }),
      ...(filters?.userId && { userId: filters.userId }),
    },
    include: {
      subject: {
        select: {
          name: true,
        },
      },
      questions: {
        select: {
          id: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
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
 * Get quiz questions
 */
export async function getQuizQuestions(quizId: string): Promise<Question[]> {
  return await prisma.question.findMany({
    where: { quizId },
    orderBy: { order: "asc" },
  });
}

/**
 * Create a quiz attempt
 */
export async function createQuizAttempt(
  userId: string,
  quizId: string
): Promise<QuizAttempt> {
  return await prisma.quizAttempt.create({
    data: {
      userId,
      quizId,
      answers: {},
      score: 0,
      completed: false,
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
      quiz: {
        include: {
          questions: true,
        },
      },
    },
  });
}

/**
 * Update quiz attempt progress
 */
export async function updateQuizAttemptProgress(
  attemptId: string,
  answers: Record<string, any>
): Promise<QuizAttempt> {
  return await prisma.quizAttempt.update({
    where: { id: attemptId },
    data: {
      answers: answers as any,
    },
  });
}

/**
 * Submit and score quiz attempt
 */
export async function submitQuizAttempt(
  attemptId: string,
  answers: Record<string, string>
): Promise<QuizAttempt> {
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: {
        include: {
          questions: true,
        },
      },
    },
  });

  if (!attempt) {
    throw new Error("Quiz attempt not found");
  }

  if (attempt.completed) {
    throw new Error("Quiz attempt already completed");
  }

  // Calculate score
  let correctAnswers = 0;
  const totalQuestions = attempt.quiz.questions.length;

  attempt.quiz.questions.forEach((question) => {
    const userAnswer = answers[question.id];
    if (userAnswer === question.correctAnswer) {
      correctAnswers++;
    }
  });

  const score = totalQuestions > 0
    ? Math.round((correctAnswers / totalQuestions) * 100)
    : 0;

  // Update attempt with final score
  return await prisma.quizAttempt.update({
    where: { id: attemptId },
    data: {
      answers: answers as any,
      score,
      completed: true,
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
          difficulty: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get quiz statistics
 */
export async function getQuizStatistics(quizId: string) {
  const attempts = await prisma.quizAttempt.findMany({
    where: { quizId, completed: true },
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
      completed: true,
    },
    include: {
      quiz: {
        select: {
          difficulty: true,
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
    include: {
      subscription: true,
      quizAttempts: {
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      },
    },
  });

  if (!user) {
    return false;
  }

  // If user has active subscription, allow unlimited attempts
  if (user.subscription && user.subscription.status === "ACTIVE") {
    return true;
  }

  // For free users, limit to 5 quizzes per day
  const attemptsToday = user.quizAttempts.length;
  return attemptsToday < 5;
}
