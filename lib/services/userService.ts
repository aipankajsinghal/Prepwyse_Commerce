/**
 * User Service
 * 
 * Centralizes all user-related database operations.
 * Provides a clean API for user CRUD operations and user data management.
 */

import { prisma } from "@/lib/prisma";
import { User, Prisma } from "@prisma/client";

/**
 * Get or create a user from Clerk authentication
 */
export async function getOrCreateUser(
  clerkId: string,
  email: string,
  name?: string | null
): Promise<User> {
  return await prisma.user.upsert({
    where: { clerkId },
    update: {
      email,
      name: name || null,
    },
    create: {
      clerkId,
      email,
      name: name || null,
      role: "STUDENT",
    },
  });
}

/**
 * Get user by Clerk ID
 */
export async function getUserByClerkId(clerkId: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { clerkId },
  });
}

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { id },
  });
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { email },
  });
}

/**
 * Update user profile
 */
export async function updateUser(
  id: string,
  data: Prisma.UserUpdateInput
): Promise<User> {
  return await prisma.user.update({
    where: { id },
    data,
  });
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
  userId: string,
  preferences: {
    preferredDifficulty?: string;
    weakAreas?: string[];
    strongAreas?: string[];
    learningStyle?: string;
  }
): Promise<User> {
  return await prisma.user.update({
    where: { id: userId },
    data: preferences,
  });
}

/**
 * Delete user and all associated data
 */
export async function deleteUser(id: string): Promise<void> {
  await prisma.user.delete({
    where: { id },
  });
}

/**
 * Get user with their subscription
 */
export async function getUserWithSubscription(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: {
        include: {
          plan: true,
        },
      },
    },
  });
}

/**
 * Get user's quiz attempts with statistics
 */
export async function getUserQuizStats(userId: string) {
  const attempts = await prisma.quizAttempt.findMany({
    where: { userId },
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

  const totalAttempts = attempts.length;
  const averageScore = attempts.length > 0
    ? attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length
    : 0;

  return {
    attempts,
    totalAttempts,
    averageScore,
  };
}

/**
 * Get user's performance by difficulty
 */
export async function getUserPerformanceByDifficulty(userId: string) {
  const attempts = await prisma.quizAttempt.findMany({
    where: { userId },
    include: {
      quiz: {
        select: {
          difficulty: true,
        },
      },
    },
  });

  const performance = {
    EASY: { total: 0, avgScore: 0 },
    MEDIUM: { total: 0, avgScore: 0 },
    HARD: { total: 0, avgScore: 0 },
  };

  attempts.forEach((attempt) => {
    const difficulty = attempt.quiz.difficulty as keyof typeof performance;
    if (performance[difficulty]) {
      performance[difficulty].total++;
      performance[difficulty].avgScore += attempt.score;
    }
  });

  // Calculate averages
  Object.keys(performance).forEach((key) => {
    const diff = key as keyof typeof performance;
    if (performance[diff].total > 0) {
      performance[diff].avgScore = performance[diff].avgScore / performance[diff].total;
    }
  });

  return performance;
}

/**
 * Export user data for GDPR compliance
 */
export async function exportUserData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      quizAttempts: {
        include: {
          quiz: true,
        },
      },
      mockTestAttempts: {
        include: {
          mockTest: true,
        },
      },
      subscription: {
        include: {
          plan: true,
        },
      },
    },
  });

  return user;
}
