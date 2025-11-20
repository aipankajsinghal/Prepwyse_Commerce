/**
 * Shared API Types
 * 
 * Common types for API request/response payloads.
 * Ensures consistency across API routes and client code.
 */

/**
 * Standard API response format
 */
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Paginated API response
 */
export interface PaginatedApiResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

/**
 * API error response
 */
export interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: any;
}

/**
 * Quiz creation request
 */
export interface CreateQuizRequest {
  title: string;
  description?: string;
  subjectId: string;
  chapterIds?: string[];
  difficulty: "EASY" | "MEDIUM" | "HARD";
  timeLimit?: number;
  questionCount?: number;
}

/**
 * Quiz attempt submission
 */
export interface SubmitQuizRequest {
  attemptId: string;
  answers: Record<string, string>; // questionId -> selectedOption
}

/**
 * Quiz attempt response
 */
export interface QuizAttemptResponse {
  attemptId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent?: number;
  completed: boolean;
}

/**
 * User profile update request
 */
export interface UpdateUserProfileRequest {
  name?: string;
  email?: string;
  preferredDifficulty?: string;
  weakAreas?: string[];
  strongAreas?: string[];
  learningStyle?: string;
}

/**
 * Subscription creation request
 */
export interface CreateSubscriptionRequest {
  planId: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
}

/**
 * Subscription status response
 */
export interface SubscriptionStatusResponse {
  status: "ACTIVE" | "CANCELLED" | "EXPIRED" | "NONE";
  plan?: {
    id: string;
    name: string;
    price: number;
    features: string[];
  };
  startDate?: string;
  endDate?: string;
  daysRemaining?: number;
}

/**
 * AI quiz generation request
 */
export interface GenerateQuizRequest {
  subjectId: string;
  chapterIds?: string[];
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  questionCount?: number;
  topics?: string[];
}

/**
 * AI recommendations request
 */
export interface GetRecommendationsRequest {
  userId: string;
  type?: "study" | "quiz" | "content";
  limit?: number;
}

/**
 * AI recommendations response
 */
export interface RecommendationsResponse {
  recommendations: Array<{
    type: string;
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    estimatedTime?: number;
    chapterId?: string;
    subjectId?: string;
  }>;
  reasoning?: string;
}

/**
 * Search request
 */
export interface SearchRequest {
  query: string;
  filters?: {
    subjectId?: string;
    difficulty?: string;
    type?: "quiz" | "chapter" | "question";
  };
  page?: number;
  perPage?: number;
}

/**
 * Search response
 */
export interface SearchResponse {
  results: Array<{
    id: string;
    type: "quiz" | "chapter" | "question";
    title: string;
    description?: string;
    relevance: number;
    metadata?: any;
  }>;
  total: number;
  page: number;
  perPage: number;
}

/**
 * Analytics request
 */
export interface GetAnalyticsRequest {
  userId?: string;
  startDate?: string;
  endDate?: string;
  groupBy?: "day" | "week" | "month";
}

/**
 * Analytics response
 */
export interface AnalyticsResponse {
  totalAttempts: number;
  averageScore: number;
  timeSpent: number;
  performanceByDifficulty: {
    EASY: { attempts: number; avgScore: number };
    MEDIUM: { attempts: number; avgScore: number };
    HARD: { attempts: number; avgScore: number };
  };
  performanceBySubject: Array<{
    subjectId: string;
    subjectName: string;
    attempts: number;
    avgScore: number;
  }>;
  timeline?: Array<{
    date: string;
    attempts: number;
    avgScore: number;
  }>;
}

/**
 * Admin statistics response
 */
export interface AdminStatisticsResponse {
  users: {
    total: number;
    active: number;
    newThisMonth: number;
  };
  subscriptions: {
    total: number;
    active: number;
    cancelled: number;
    expired: number;
    revenue: number;
  };
  quizzes: {
    total: number;
    totalAttempts: number;
    averageScore: number;
  };
  questions: {
    total: number;
    pending: number;
    approved: number;
  };
}

/**
 * Flashcard review request
 */
export interface FlashcardReviewRequest {
  cardId: string;
  difficulty: "again" | "hard" | "good" | "easy";
}

/**
 * Study plan creation request
 */
export interface CreateStudyPlanRequest {
  title: string;
  description?: string;
  subjects: string[];
  targetDate?: string;
  dailyGoalMinutes?: number;
}

/**
 * Gamification points response
 */
export interface GamificationPointsResponse {
  totalPoints: number;
  level: number;
  streak: number;
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    unlockedAt: string;
  }>;
  leaderboardRank?: number;
}

/**
 * Referral stats response
 */
export interface ReferralStatsResponse {
  referralCode: string;
  totalReferrals: number;
  successfulReferrals: number;
  pendingReferrals: number;
  rewardsEarned: number;
}
