/**
 * Database Query Optimization Best Practices
 *
 * This file documents and implements optimizations for common database patterns:
 * 1. N+1 Query Prevention
 * 2. Batch Operations
 * 3. Index Usage
 * 4. Efficient Relationships
 */

import { prisma } from './prisma';

/**
 * OPTIMIZATION 1: Prevent N+1 Queries
 *
 * ❌ BAD: N+1 Query
 * const quizzes = await prisma.quiz.findMany();
 * for (const quiz of quizzes) {
 *   const attempts = await prisma.quizAttempt.findMany({ where: { quizId: quiz.id } });
 * }
 *
 * ✅ GOOD: Use include() to fetch related data in one query
 * const quizzes = await prisma.quiz.findMany({
 *   include: {
 *     attempts: true,
 *   },
 * });
 */

/**
 * Get user's quiz attempts with quiz details (prevents N+1)
 */
export async function getUserQuizAttempts(userId: string) {
  return prisma.quizAttempt.findMany({
    where: { userId },
    include: {
      quiz: {
        include: {
          // Can nest includes for deeper relationships
        },
      },
    },
    orderBy: { startedAt: 'desc' },
  });
}

/**
 * Get subject with all chapters and question counts (prevents N+1)
 */
export async function getSubjectWithChapters(subjectId: string) {
  return prisma.subject.findUnique({
    where: { id: subjectId },
    include: {
      chapters: {
        include: {
          _count: {
            select: { questions: true }, // Count without fetching all
          },
        },
      },
    },
  });
}

/**
 * OPTIMIZATION 2: Batch Operations
 *
 * ❌ BAD: Loop with individual creates
 * for (const question of questions) {
 *   await prisma.question.create({ data: question });
 * }
 *
 * ✅ GOOD: Use createMany() for batch insert
 * await prisma.question.createMany({ data: questions });
 */

/**
 * Create multiple questions in one query
 */
export async function createQuestionsInBatch(
  chapterId: string,
  questions: Array<{
    questionText: string;
    options: string[];
    correctAnswer: string;
    explanation?: string;
    difficulty?: string;
  }>
) {
  return prisma.question.createMany({
    data: questions.map((q) => ({
      chapterId,
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: q.difficulty || 'medium',
    })),
  });
}

/**
 * Update multiple records in one query (using updateMany)
 */
export async function markMultipleRecommendationsAsRead(
  recommendationIds: string[],
  userId: string
) {
  return prisma.recommendation.updateMany({
    where: {
      id: { in: recommendationIds },
      userId, // Safety: only update user's own recommendations
    },
    data: {
      isRead: true,
    },
  });
}

/**
 * OPTIMIZATION 3: Select Only Required Fields
 *
 * ❌ BAD: Fetches all fields
 * const users = await prisma.user.findMany();
 *
 * ✅ GOOD: Select only needed fields
 * const users = await prisma.user.findMany({
 *   select: { id: true, email: true, name: true },
 * });
 */

/**
 * Get subscription plans for listing (only public fields)
 */
export async function getActiveSubscriptionPlans() {
  return prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      displayName: true,
      description: true,
      price: true,
      durationDays: true,
      features: true,
      order: true,
    },
    orderBy: { order: 'asc' },
  });
}

/**
 * OPTIMIZATION 4: Pagination for Large Result Sets
 *
 * ❌ BAD: Fetches all records
 * const questions = await prisma.question.findMany();
 *
 * ✅ GOOD: Use skip() and take() for pagination
 * const questions = await prisma.question.findMany({
 *   skip: (page - 1) * pageSize,
 *   take: pageSize,
 * });
 */

/**
 * Get paginated quiz attempts
 */
export async function getPaginatedQuizAttempts(
  userId: string,
  page: number = 1,
  pageSize: number = 10
) {
  const skip = (page - 1) * pageSize;

  const [attempts, total] = await Promise.all([
    prisma.quizAttempt.findMany({
      where: { userId },
      include: { quiz: true },
      orderBy: { startedAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.quizAttempt.count({ where: { userId } }),
  ]);

  return {
    attempts,
    total,
    pageCount: Math.ceil(total / pageSize),
    currentPage: page,
  };
}

/**
 * OPTIMIZATION 5: Efficient Filtering
 *
 * Always use indexes for frequently filtered fields
 * Examples of indexed fields in schema:
 * - User.clerkId (UNIQUE)
 * - User.email (UNIQUE)
 * - QuizAttempt.userId
 * - QuizAttempt.status
 * - Subscription.status
 * - Transaction.status
 */

/**
 * Get pending transactions (uses index on status)
 */
export async function getPendingTransactions() {
  return prisma.transaction.findMany({
    where: { status: 'pending' },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });
}

/**
 * OPTIMIZATION 6: Use findUnique for unique fields
 *
 * ❌ BAD: Uses full table scan
 * const user = await prisma.user.findFirst({ where: { email } });
 *
 * ✅ GOOD: Uses unique index
 * const user = await prisma.user.findUnique({ where: { email } });
 */

/**
 * Get user by email (uses unique index)
 */
export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: { subscription: true },
  });
}

/**
 * OPTIMIZATION 7: Database Indexes Summary
 *
 * Already implemented in schema:
 * - User: clerkId (UNIQUE), email (UNIQUE), referralCode (UNIQUE)
 * - Chapter: (subjectId, name) UNIQUE
 * - Question: chapterId INDEX
 * - QuizAttempt: userId INDEX, quizId INDEX, (userId, startedAt) INDEX
 * - Subscription: userId UNIQUE, (status, endDate) INDEX
 * - Transaction: (userId, createdAt) INDEX, status INDEX
 * - Leaderboard: (period, periodKey, points) INDEX, (userId, period, periodKey) UNIQUE
 * - StudySession: (planId, scheduledDate) INDEX
 * - FlashcardProgress: (userId, flashcardId) UNIQUE, (userId, nextReviewDate) INDEX
 * - And many more for efficient queries
 */

/**
 * OPTIMIZATION 8: Use $transaction for multiple operations
 *
 * Ensures all-or-nothing semantics
 */

export async function createQuizWithQuestions(
  quizData: {
    title: string;
    description?: string;
    subjectId?: string;
    chapterIds: string[];
    questionCount: number;
    duration: number;
  },
  questions: Array<{
    chapterId: string;
    questionText: string;
    options: string[];
    correctAnswer: string;
    explanation?: string;
    difficulty?: string;
  }>
) {
  return prisma.$transaction(async (tx) => {
    // Create quiz
    const quiz = await tx.quiz.create({
      data: {
        title: quizData.title,
        description: quizData.description,
        subjectId: quizData.subjectId,
        chapterIds: quizData.chapterIds,
        questionCount: quizData.questionCount,
        duration: quizData.duration,
      },
    });

    // Create questions in batch
    await tx.question.createMany({
      data: questions.map((q) => ({
        chapterId: q.chapterId,
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty || 'medium',
      })),
    });

    return quiz;
  });
}

/**
 * Common Query Patterns Summary
 *
 * 1. Fetch with relationships: Use include()
 * 2. Multiple inserts: Use createMany()
 * 3. Multiple updates: Use updateMany()
 * 4. Large result sets: Use skip() + take()
 * 5. Filtered queries: Ensure field is indexed
 * 6. Unique lookups: Use findUnique()
 * 7. Multiple operations: Use $transaction()
 * 8. Only needed fields: Use select()
 */
