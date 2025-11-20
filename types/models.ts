/**
 * Domain Model Types
 * 
 * Extended types for domain models beyond Prisma-generated types.
 * Includes computed properties, relationships, and view models.
 */

import { User, Quiz, Question, QuizAttempt, Subscription, SubscriptionPlan } from "@prisma/client";

/**
 * User with subscription details
 */
export type UserWithSubscription = User & {
  subscription: (Subscription & {
    plan: SubscriptionPlan;
  }) | null;
};

/**
 * User with statistics
 */
export type UserWithStats = User & {
  statistics: {
    totalAttempts: number;
    averageScore: number;
    totalTimeSpent: number;
    streak: number;
    level: number;
    points: number;
  };
};

/**
 * Quiz with questions and metadata
 */
export type QuizWithQuestions = Quiz & {
  questions: Question[];
  subject: {
    id: string;
    name: string;
  };
  _count?: {
    questions: number;
    attempts: number;
  };
};

/**
 * Quiz with statistics
 */
export type QuizWithStats = Quiz & {
  statistics: {
    totalAttempts: number;
    averageScore: number;
    completionRate: number;
    averageTime: number;
  };
};

/**
 * Quiz attempt with quiz details
 */
export type QuizAttemptWithQuiz = QuizAttempt & {
  quiz: QuizWithQuestions;
  user?: {
    id: string;
    name: string | null;
  };
};

/**
 * Question with chapter and subject
 */
export type QuestionWithContext = Question & {
  chapter: {
    id: string;
    title: string;
    subject: {
      id: string;
      name: string;
    };
  };
};

/**
 * Subscription with plan and user
 */
export type SubscriptionWithDetails = Subscription & {
  plan: SubscriptionPlan;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  subjectId: string;
  subjectName: string;
  totalAttempts: number;
  averageScore: number;
  improvement: number; // percentage change from previous period
  weakChapters: Array<{
    id: string;
    title: string;
    averageScore: number;
  }>;
  strongChapters: Array<{
    id: string;
    title: string;
    averageScore: number;
  }>;
}

/**
 * Learning path node
 */
export interface LearningPathNode {
  id: string;
  type: "quiz" | "chapter" | "practice" | "review";
  title: string;
  description?: string;
  estimatedMinutes: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  isUnlocked: boolean;
  isCompleted: boolean;
  prerequisites?: string[];
  resources?: {
    type: string;
    id: string;
    title: string;
  }[];
}

/**
 * Learning path
 */
export interface LearningPath {
  id: string;
  title: string;
  description: string;
  nodes: LearningPathNode[];
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  estimatedTotalHours: number;
}

/**
 * Achievement
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "streak" | "score" | "completion" | "social" | "special";
  requirement: {
    type: string;
    target: number;
  };
  reward: {
    points: number;
    badge?: string;
  };
  unlockedAt?: Date;
  progress?: {
    current: number;
    target: number;
  };
}

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  score: number;
  avatar?: string;
  isCurrentUser?: boolean;
}

/**
 * Study session
 */
export interface StudySession {
  id: string;
  userId: string;
  subjectId: string;
  chapterId?: string;
  startTime: Date;
  endTime?: Date;
  durationMinutes: number;
  focusScore?: number; // 0-100, based on activity patterns
  completedTasks: number;
  notes?: string;
}

/**
 * Flashcard with spaced repetition data
 */
export interface FlashcardWithSRS {
  id: string;
  front: string;
  back: string;
  chapterId: string;
  nextReviewDate: Date;
  interval: number; // days until next review
  easeFactor: number; // difficulty modifier
  repetitions: number;
  lastReviewDate?: Date;
  lastReviewDifficulty?: "again" | "hard" | "good" | "easy";
}

/**
 * Recommendation item
 */
export interface Recommendation {
  id: string;
  type: "chapter" | "quiz" | "practice" | "review" | "study-note";
  title: string;
  description: string;
  reasoning: string;
  priority: "high" | "medium" | "low";
  estimatedMinutes: number;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  resourceId?: string;
  metadata?: {
    subjectId?: string;
    chapterId?: string;
    completionRate?: number;
  };
}

/**
 * Question generation job
 */
export interface QuestionGenerationJob {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  subjectId: string;
  chapterId: string;
  questionCount: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  generatedQuestions?: Question[];
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

/**
 * Practice paper with questions
 */
export interface PracticePaperWithQuestions {
  id: string;
  title: string;
  description?: string;
  subjectId: string;
  examType: string;
  duration: number;
  totalMarks: number;
  questions: Question[];
  isPublished: boolean;
  createdAt: Date;
}

/**
 * Study note with metadata
 */
export interface StudyNoteWithMetadata {
  id: string;
  title: string;
  content: string;
  chapterId: string;
  tags?: string[];
  likes: number;
  views: number;
  isBookmarked?: boolean;
  author?: {
    id: string;
    name: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Search result item
 */
export interface SearchResultItem {
  id: string;
  type: "quiz" | "chapter" | "question" | "study-note" | "practice-paper";
  title: string;
  description?: string;
  relevanceScore: number;
  highlights?: string[];
  metadata: {
    subjectId?: string;
    subjectName?: string;
    difficulty?: string;
    createdAt?: Date;
  };
}

/**
 * Notification
 */
export interface Notification {
  id: string;
  userId: string;
  type: "achievement" | "reminder" | "subscription" | "quiz" | "social";
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

/**
 * User preferences
 */
export interface UserPreferences {
  theme: "light" | "dark" | "ocean" | "forest" | "sunset";
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    studyReminders: boolean;
    achievements: boolean;
  };
  study: {
    preferredDifficulty: "EASY" | "MEDIUM" | "HARD";
    dailyGoalMinutes: number;
    reminderTime?: string;
  };
  privacy: {
    showInLeaderboard: boolean;
    shareProgress: boolean;
  };
}

/**
 * Quiz filter options
 */
export interface QuizFilters {
  subjectId?: string;
  chapterIds?: string[];
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  status?: "published" | "draft";
  createdBy?: string;
  sortBy?: "createdAt" | "title" | "difficulty" | "attempts";
  sortOrder?: "asc" | "desc";
}

/**
 * Date range filter
 */
export interface DateRangeFilter {
  startDate: Date;
  endDate: Date;
}
