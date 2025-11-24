import { generateChatCompletion, isAnyAIConfigured } from "./ai-provider";
import { prisma } from "./prisma";
import { z } from "zod";

// Zod schemas for AI response validation
const QuestionSchema = z.object({
  questionText: z.string().min(10, "Question text must be at least 10 characters"),
  options: z.array(z.string()).length(4, "Must have exactly 4 options"),
  correctAnswer: z.string().min(1, "Correct answer is required"),
  explanation: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
});

const QuestionsArraySchema = z.array(QuestionSchema).min(1, "At least one question is required");

const MockTestSectionSchema = z.object({
  name: z.string().min(1, "Section name is required"),
  questions: z.array(QuestionSchema).min(1, "Section must have at least one question"),
});

const MockTestResponseSchema = z.object({
  mockTest: z.object({
    title: z.string().min(1, "Title is required"),
    examType: z.string().min(1, "Exam type is required"),
    description: z.string().optional(),
    duration: z.number().positive("Duration must be positive"),
    totalQuestions: z.number().positive("Total questions must be positive"),
  }),
  sections: z.array(MockTestSectionSchema).min(1, "At least one section is required"),
});

const RecommendationSchema = z.object({
  type: z.enum(["study_plan", "topic", "difficulty_adjustment", "content"]),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  priority: z.number().min(1).max(10),
  actionItems: z.array(z.string()).optional(),
});

const RecommendationsResponseSchema = z.object({
  recommendations: z.array(RecommendationSchema),
  weakAreas: z.array(z.string()).optional(),
  strongAreas: z.array(z.string()).optional(),
  suggestedDifficulty: z.enum(["easy", "medium", "hard"]).optional(),
});

const ContentRecommendationSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  chapter: z.string().min(1, "Chapter is required"),
  reason: z.string().min(1, "Reason is required"),
  priority: z.number().min(1).max(5),
  estimatedTime: z.string().min(1, "Estimated time is required"),
});

const ContentRecommendationsResponseSchema = z.object({
  recommendations: z.array(ContentRecommendationSchema),
});

/**
 * Generate AI-powered quiz questions based on chapters and difficulty
 */
export async function generateAIQuestions(params: {
  subjectName: string;
  chapterNames: string[];
  questionCount: number;
  difficulty: "easy" | "medium" | "hard";
  userId: string;
}) {
  if (!isAnyAIConfigured()) {
    throw new Error("No AI provider is configured. Please add OPENAI_API_KEY or GEMINI_API_KEY");
  }

  const { subjectName, chapterNames, questionCount, difficulty, userId } = params;

  // Get user's performance history to personalize questions
  const userAttempts = await prisma.quizAttempt.findMany({
    where: { userId },
    orderBy: { startedAt: "desc" },
    take: 5,
  });

  const prompt = `You are an expert commerce education content creator. Generate ${questionCount} multiple-choice questions for students preparing for Indian commerce exams.

Subject: ${subjectName}
Chapters: ${chapterNames.join(", ")}
Difficulty: ${difficulty}
${userAttempts.length > 0 ? `User's recent average score: ${Math.round((userAttempts.reduce((acc, a) => acc + (a.score / a.totalQuestions), 0) / userAttempts.length) * 100)}%` : ""}

Requirements:
1. Each question should have exactly 4 options (A, B, C, D)
2. Questions should be relevant to the specified chapters
3. Include a detailed explanation for the correct answer
4. Difficulty level should match: ${difficulty}
5. Questions should be exam-focused and practical
6. Return ONLY valid JSON, no markdown or extra text

Return format (JSON array):
[
  {
    "questionText": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Detailed explanation of why this is correct",
    "difficulty": "${difficulty}"
  }
]`;

  const content = await generateChatCompletion({
    prompt,
    systemPrompt: "You are an expert commerce education content creator specializing in Indian commerce curriculum. Always return valid JSON only.",
    temperature: 0.7,
    jsonMode: true,
  });

  let parsed;
  try {
    parsed = JSON.parse(content);
    // Handle if the response is wrapped in a questions array
    const questions = parsed.questions || parsed;
    const questionsArray = Array.isArray(questions) ? questions : [questions];
    
    // Validate with Zod schema
    const validatedQuestions = QuestionsArraySchema.parse(questionsArray);
    return validatedQuestions;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("AI response validation failed:", error.issues);
      throw new Error(`Invalid AI response format: ${error.issues.map(e => e.message).join(", ")}`);
    }
    console.error("Failed to parse AI response:", content);
    throw new Error("Invalid AI response format");
  }
}

/**
 * Generate AI-powered mock test with questions
 */
export async function generateAIMockTest(params: {
  title: string;
  examType: string;
  description?: string;
  duration: number;
  totalQuestions: number;
  sections: Array<{ name: string; questions: number; subjectId?: string }>;
}) {
  if (!isAnyAIConfigured()) {
    throw new Error("No AI provider is configured. Please add OPENAI_API_KEY or GEMINI_API_KEY");
  }

  const { title, examType, description, duration, totalQuestions, sections } = params;

  const prompt = `You are an expert in creating comprehensive mock tests for Indian commerce education. Generate a complete mock test with the following specifications:

Title: ${title}
Exam Type: ${examType}
Duration: ${duration} minutes
Total Questions: ${totalQuestions}

Sections:
${sections.map((s, i) => `${i + 1}. ${s.name}: ${s.questions} questions`).join("\n")}

Requirements:
1. Generate exactly ${totalQuestions} multiple-choice questions distributed across the sections as specified
2. Each question must have exactly 4 options (A, B, C, D)
3. Include detailed explanations for correct answers
4. Questions should be exam-pattern focused for ${examType}
5. Mix difficulty levels: 40% easy, 40% medium, 20% hard
6. Cover comprehensive topics within each section
7. Questions should test conceptual understanding, not just memorization
8. Return ONLY valid JSON, no markdown or extra text

Return format (JSON object):
{
  "mockTest": {
    "title": "${title}",
    "examType": "${examType}",
    "description": "${description || `Complete mock test for ${examType}`}",
    "duration": ${duration},
    "totalQuestions": ${totalQuestions}
  },
  "sections": [
    {
      "name": "Section name",
      "questions": [
        {
          "questionText": "Question text here?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "Option A",
          "explanation": "Detailed explanation",
          "difficulty": "easy|medium|hard",
          "section": "Section name"
        }
      ]
    }
  ]
}`;

  const content = await generateChatCompletion({
    prompt,
    systemPrompt: "You are an expert commerce education content creator specializing in creating comprehensive mock tests for Indian commerce curriculum. Always return valid JSON only.",
    temperature: 0.7,
    jsonMode: true,
    maxTokens: 8000, // Large token limit for full mock test
  });

  let parsed;
  try {
    parsed = JSON.parse(content);
    
    // Validate with Zod schema
    const validatedResponse = MockTestResponseSchema.parse(parsed);
    return validatedResponse;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("AI mock test response validation failed:", error.issues);
      throw new Error(`Invalid AI mock test response: ${error.issues.map(e => e.message).join(", ")}`);
    }
    console.error("Failed to parse AI mock test response:", content);
    throw new Error("Invalid AI response format for mock test");
  }
}

/**
 * Analyze user performance and generate personalized recommendations
 */
export async function generatePersonalizedRecommendations(userId: string) {
  if (!isAnyAIConfigured()) {
    throw new Error("No AI provider is configured. Please add OPENAI_API_KEY or GEMINI_API_KEY");
  }

  // Get user's performance data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      quizAttempts: {
        include: {
          quiz: true,
        },
        orderBy: { startedAt: "desc" },
        take: 20,
      },
      mockTests: {
        orderBy: { startedAt: "desc" },
        take: 5,
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Calculate performance metrics
  const totalQuizzes = user.quizAttempts.length;
  const averageScore = totalQuizzes > 0
    ? user.quizAttempts.reduce((acc, attempt) => acc + (attempt.score / attempt.totalQuestions), 0) / totalQuizzes
    : 0;

  const performanceData = {
    totalQuizzes,
    averageScore: Math.round(averageScore * 100),
    recentScores: user.quizAttempts.slice(0, 5).map(a => ({
      score: Math.round((a.score / a.totalQuestions) * 100),
      date: a.startedAt,
    })),
    weakAreas: user.weakAreas || [],
    strongAreas: user.strongAreas || [],
  };

  const prompt = `As an AI education advisor, analyze this student's performance and provide personalized recommendations.

Performance Data:
${JSON.stringify(performanceData, null, 2)}

Generate 3-5 actionable recommendations covering:
1. Study topics to focus on
2. Difficulty level adjustments
3. Study strategies
4. Time management tips
5. Specific content to review

Return ONLY valid JSON in this format:
{
  "recommendations": [
    {
      "type": "study_plan" | "topic" | "difficulty_adjustment" | "content",
      "title": "Brief title",
      "description": "Detailed recommendation",
      "priority": 1-10,
      "actionItems": ["specific action 1", "specific action 2"]
    }
  ],
  "weakAreas": ["area1", "area2"],
  "strongAreas": ["area1", "area2"],
  "suggestedDifficulty": "easy" | "medium" | "hard"
}`;

  const content = await generateChatCompletion({
    prompt,
    systemPrompt: "You are an expert education advisor specializing in personalized learning strategies. Always return valid JSON only.",
    temperature: 0.7,
    jsonMode: true,
  });

  try {
    const parsed = JSON.parse(content);
    const validated = RecommendationsResponseSchema.parse(parsed);
    return validated;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("AI recommendations response validation failed:", error.issues);
      throw new Error(`Invalid AI recommendations response: ${error.issues.map(e => e.message).join(", ")}`);
    }
    throw error;
  }
}

/**
 * Generate AI explanation for a question
 */
export async function generateQuestionExplanation(params: {
  questionText: string;
  options: string[];
  correctAnswer: string;
  userAnswer?: string;
  subject: string;
  chapter: string;
}) {
  if (!isAnyAIConfigured()) {
    throw new Error("No AI provider is configured. Please add OPENAI_API_KEY or GEMINI_API_KEY");
  }

  const { questionText, options, correctAnswer, userAnswer, subject, chapter } = params;

  const prompt = `Generate a detailed, student-friendly explanation for this commerce question.

Subject: ${subject}
Chapter: ${chapter}
Question: ${questionText}
Options: ${options.join(", ")}
Correct Answer: ${correctAnswer}
${userAnswer ? `Student's Answer: ${userAnswer}` : ""}

Provide:
1. Why the correct answer is right
2. ${userAnswer && userAnswer !== correctAnswer ? "Why the student's answer is incorrect" : ""}
3. Key concepts to remember
4. Related topics to study
5. Practical example if applicable

Keep it concise but thorough, in a friendly teaching tone.`;

  return await generateChatCompletion({
    prompt,
    systemPrompt: "You are a friendly and knowledgeable commerce teacher who explains concepts clearly.",
    temperature: 0.7,
    maxTokens: 500,
  });
}

/**
 * Determine adaptive difficulty based on performance
 */
export async function determineAdaptiveDifficulty(userId: string): Promise<"easy" | "medium" | "hard"> {
  const recentAttempts = await prisma.quizAttempt.findMany({
    where: { userId },
    orderBy: { startedAt: "desc" },
    take: 10,
  });

  if (recentAttempts.length === 0) {
    return "medium"; // Default for new users
  }

  const averageScore = recentAttempts.reduce(
    (acc, attempt) => acc + (attempt.score / attempt.totalQuestions),
    0
  ) / recentAttempts.length;

  // Adaptive logic
  if (averageScore >= 0.8) {
    return "hard"; // Student is doing well, increase difficulty
  } else if (averageScore >= 0.6) {
    return "medium"; // Student is average, maintain current level
  } else {
    return "easy"; // Student is struggling, decrease difficulty
  }
}

/**
 * Generate smart content recommendations
 */
export async function generateContentRecommendations(params: {
  userId: string;
  subjectId?: string;
}) {
  if (!isAnyAIConfigured()) {
    throw new Error("No AI provider is configured. Please add OPENAI_API_KEY or GEMINI_API_KEY");
  }

  const { userId, subjectId } = params;

  // Get user's quiz history
  const quizAttempts = await prisma.quizAttempt.findMany({
    where: { userId },
    include: {
      quiz: true,
    },
    orderBy: { startedAt: "desc" },
    take: 10,
  });

  // Get available subjects and chapters
  const subjects = await prisma.subject.findMany({
    where: subjectId ? { id: subjectId } : undefined,
    include: {
      chapters: {
        include: {
          _count: {
            select: { questions: true },
          },
        },
      },
    },
  });

  const prompt = `Based on the student's quiz history, recommend specific chapters and topics they should study next.

Available Subjects: ${subjects.map(s => s.name).join(", ")}
Recent Quiz Performance: ${quizAttempts.slice(0, 5).map(a => 
  `${Math.round((a.score / a.totalQuestions) * 100)}%`
).join(", ")}

Recommend:
1. 3-5 specific chapters to focus on
2. Reason for each recommendation
3. Suggested study order
4. Estimated time for each topic

Return ONLY valid JSON:
{
  "recommendations": [
    {
      "subject": "Subject name",
      "chapter": "Chapter name",
      "reason": "Why study this",
      "priority": 1-5,
      "estimatedTime": "hours"
    }
  ]
}`;

  const content = await generateChatCompletion({
    prompt,
    systemPrompt: "You are an education advisor providing study recommendations. Always return valid JSON only.",
    temperature: 0.7,
    jsonMode: true,
  });

  try {
    const parsed = JSON.parse(content);
    const validated = ContentRecommendationsResponseSchema.parse(parsed);
    return validated;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("AI content recommendations response validation failed:", error.issues);
      throw new Error(`Invalid AI content recommendations response: ${error.issues.map(e => e.message).join(", ")}`);
    }
    throw error;
  }
}
