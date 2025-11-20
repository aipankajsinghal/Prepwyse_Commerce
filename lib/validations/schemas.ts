/**
 * Validation Schemas
 * 
 * Zod schemas for validating API request payloads.
 * Ensures data integrity and provides helpful error messages.
 * 
 * Usage:
 * ```typescript
 * import { createQuizSchema } from '@/lib/validations/schemas';
 * 
 * const result = createQuizSchema.safeParse(req.body);
 * if (!result.success) {
 *   return NextResponse.json({ error: result.error.format() }, { status: 400 });
 * }
 * ```
 */

import { z } from "zod";

/**
 * Common validation rules
 */
const mongoIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ID format");
const uuidSchema = z.string().uuid("Invalid UUID format");
const emailSchema = z.string().email("Invalid email address");
const urlSchema = z.string().url("Invalid URL");

/**
 * Difficulty levels
 */
const difficultySchema = z.enum(["EASY", "MEDIUM", "HARD"]);

/**
 * User validation schemas
 */
export const updateUserProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: emailSchema.optional(),
  preferredDifficulty: difficultySchema.optional(),
  weakAreas: z.array(z.string()).optional(),
  strongAreas: z.array(z.string()).optional(),
  learningStyle: z.string().max(50).optional(),
});

export const userPreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "ocean", "forest", "sunset"]).optional(),
  language: z.string().length(2).optional(),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    studyReminders: z.boolean(),
    achievements: z.boolean(),
  }).optional(),
});

/**
 * Quiz validation schemas
 */
export const createQuizSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().max(1000).optional(),
  subjectId: z.string().min(1, "Subject is required"),
  chapterIds: z.array(z.string()).optional(),
  difficulty: difficultySchema,
  timeLimit: z.number().int().min(1).max(300).optional(), // minutes
  questionCount: z.number().int().min(1).max(100).optional(),
});

export const updateQuizSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(1000).optional(),
  difficulty: difficultySchema.optional(),
  timeLimit: z.number().int().min(1).max(300).optional(),
  isPublished: z.boolean().optional(),
});

export const submitQuizSchema = z.object({
  attemptId: z.string().min(1, "Attempt ID is required"),
  answers: z.record(z.string(), z.string()),
  timeSpent: z.number().int().min(0).optional(), // seconds
});

/**
 * Question validation schemas
 */
export const createQuestionSchema = z.object({
  text: z.string().min(10, "Question text must be at least 10 characters").max(1000),
  options: z.array(z.string()).min(2).max(6),
  correctAnswer: z.string().min(1, "Correct answer is required"),
  explanation: z.string().max(2000).optional(),
  chapterId: z.string().min(1, "Chapter is required"),
  difficulty: difficultySchema,
  marks: z.number().int().min(1).max(10).default(1),
  type: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"]).default("MULTIPLE_CHOICE"),
});

export const updateQuestionSchema = createQuestionSchema.partial();

/**
 * Subscription validation schemas
 */
export const createSubscriptionSchema = z.object({
  planId: z.string().min(1, "Plan ID is required"),
  razorpayOrderId: z.string().optional(),
  razorpayPaymentId: z.string().optional(),
  razorpaySignature: z.string().optional(),
});

export const createSubscriptionPlanSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  price: z.number().min(0),
  durationMonths: z.number().int().min(1).max(36),
  features: z.array(z.string()),
  isActive: z.boolean().default(true),
  maxQuizzes: z.number().int().min(-1).optional(), // -1 for unlimited
  maxMockTests: z.number().int().min(-1).optional(),
});

export const updateSubscriptionPlanSchema = createSubscriptionPlanSchema.partial();

/**
 * AI generation validation schemas
 */
export const generateQuizAISchema = z.object({
  subjectId: z.string().min(1, "Subject is required"),
  chapterIds: z.array(z.string()).min(1, "At least one chapter is required"),
  difficulty: difficultySchema,
  questionCount: z.number().int().min(1).max(50).default(10),
  topics: z.array(z.string()).optional(),
});

export const getRecommendationsSchema = z.object({
  type: z.enum(["study", "quiz", "content"]).optional(),
  limit: z.number().int().min(1).max(20).default(5),
});

export const explainQuestionSchema = z.object({
  questionId: z.string().min(1, "Question ID is required"),
  userAnswer: z.string().optional(),
});

/**
 * Search validation schemas
 */
export const searchSchema = z.object({
  query: z.string().min(1, "Search query is required").max(200),
  filters: z.object({
    subjectId: z.string().optional(),
    difficulty: difficultySchema.optional(),
    type: z.enum(["quiz", "chapter", "question"]).optional(),
  }).optional(),
  page: z.number().int().min(1).default(1),
  perPage: z.number().int().min(1).max(100).default(20),
});

/**
 * Analytics validation schemas
 */
export const getAnalyticsSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  groupBy: z.enum(["day", "week", "month"]).optional(),
  subjectId: z.string().optional(),
});

/**
 * Flashcard validation schemas
 */
export const createFlashcardSchema = z.object({
  front: z.string().min(1).max(500),
  back: z.string().min(1).max(2000),
  chapterId: z.string().min(1, "Chapter is required"),
  tags: z.array(z.string()).optional(),
});

export const reviewFlashcardSchema = z.object({
  cardId: z.string().min(1, "Card ID is required"),
  difficulty: z.enum(["again", "hard", "good", "easy"]),
});

/**
 * Study plan validation schemas
 */
export const createStudyPlanSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(1000).optional(),
  subjectIds: z.array(z.string()).min(1, "At least one subject is required"),
  targetDate: z.string().datetime().optional(),
  dailyGoalMinutes: z.number().int().min(15).max(480).default(60),
});

export const createStudySessionSchema = z.object({
  planId: z.string().min(1, "Plan ID is required"),
  subjectId: z.string().min(1, "Subject is required"),
  chapterId: z.string().optional(),
  durationMinutes: z.number().int().min(1).max(480),
  notes: z.string().max(2000).optional(),
});

/**
 * Gamification validation schemas
 */
export const addPointsSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  points: z.number().int().min(1).max(1000),
  reason: z.string().max(200),
});

/**
 * Referral validation schemas
 */
export const applyReferralSchema = z.object({
  referralCode: z.string().length(8, "Referral code must be 8 characters"),
});

/**
 * Practice paper validation schemas
 */
export const createPracticePaperSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(1000).optional(),
  subjectId: z.string().min(1, "Subject is required"),
  examType: z.string().min(1).max(50),
  duration: z.number().int().min(30).max(300), // minutes
  totalMarks: z.number().int().min(1).max(500),
  questionIds: z.array(z.string()).min(1, "At least one question is required"),
  isPublished: z.boolean().default(false),
});

/**
 * Study note validation schemas
 */
export const createStudyNoteSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(10).max(50000),
  chapterId: z.string().min(1, "Chapter is required"),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().default(false),
});

export const updateStudyNoteSchema = createStudyNoteSchema.partial();

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  perPage: z.number().int().min(1).max(100).default(20),
});

/**
 * ID parameter schema
 */
export const idParamSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

/**
 * Helper function to validate request body
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Helper function to format validation errors
 */
export function formatValidationErrors(error: z.ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};
  error.errors.forEach((err) => {
    const path = err.path.join(".");
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(err.message);
  });
  return formatted;
}
