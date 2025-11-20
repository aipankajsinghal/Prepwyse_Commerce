/**
 * Automated Question Generation Service
 * Phase E: AI-powered bulk question generation with validation
 */

import { generateChatCompletion, isAnyAIConfigured } from "./ai-provider";
import { prisma } from "./prisma";

interface GenerateQuestionsParams {
  adminId: string;
  adminName: string;
  subjectId?: string;
  chapterIds?: string[];
  questionCount: number;
  difficulty?: "easy" | "medium" | "hard";
  sourceContent?: string;
  sourceType: "ai" | "upload" | "manual";
}

interface GeneratedQuestion {
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty: "easy" | "medium" | "hard";
  tags?: string[];
  qualityScore?: number;
}

/**
 * Start a bulk question generation job
 */
export async function startQuestionGenerationJob(params: GenerateQuestionsParams) {
  if (!isAnyAIConfigured()) {
    throw new Error("No AI provider is configured");
  }

  const {
    adminId,
    adminName,
    subjectId,
    chapterIds,
    questionCount,
    difficulty,
    sourceContent,
    sourceType,
  } = params;

  // Validate input
  if (!chapterIds || chapterIds.length === 0) {
    throw new Error("At least one chapter must be selected");
  }

  if (questionCount < 1 || questionCount > 100) {
    throw new Error("Question count must be between 1 and 100");
  }

  // Create job
  const job = await prisma.questionGenerationJob.create({
    data: {
      adminId,
      adminName,
      subjectId,
      chapterIds,
      questionCount,
      difficulty,
      sourceType,
      sourceContent,
      status: "pending",
    },
  });

  // Process job asynchronously
  processQuestionGenerationJob(job.id).catch(async (error) => {
    console.error("Error processing question generation job:", error);
    try {
      await prisma.questionGenerationJob.update({
        where: { id: job.id },
        data: {
          status: "failed",
          errorMessage: error.message,
        },
      });
    } catch (updateError) {
      console.error("Failed to update job status after error:", updateError);
    }
  });

  return job;
}

/**
 * Process question generation job
 */
async function processQuestionGenerationJob(jobId: string) {
  const job = await prisma.questionGenerationJob.findUnique({
    where: { id: jobId },
  });

  if (!job) {
    throw new Error("Job not found");
  }

  // Update status
  await prisma.questionGenerationJob.update({
    where: { id: jobId },
    data: {
      status: "processing",
      startedAt: new Date(),
    },
  });

  try {
    const chapterIds = job.chapterIds as string[];
    const questionsPerChapter = Math.ceil(job.questionCount / chapterIds.length);

    let totalGenerated = 0;

    // Generate questions for each chapter
    for (let i = 0; i < chapterIds.length; i++) {
      const chapterId = chapterIds[i];
      const questionsToGenerate =
        i === chapterIds.length - 1
          ? job.questionCount - totalGenerated
          : questionsPerChapter;

      const questions = await generateQuestionsForChapter({
        chapterId,
        count: questionsToGenerate,
        difficulty: job.difficulty as "easy" | "medium" | "hard" | undefined,
        sourceContent: job.sourceContent || undefined,
      });

      // Store generated questions
      for (const question of questions) {
        await prisma.generatedQuestion.create({
          data: {
            jobId,
            chapterId,
            questionText: question.questionText,
            options: question.options,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
            difficulty: question.difficulty,
            tags: question.tags || [],
            qualityScore: question.qualityScore,
            status: "pending_review",
          },
        });

        totalGenerated++;
      }

      // Update progress
      const progress = Math.round((totalGenerated / job.questionCount) * 100);
      await prisma.questionGenerationJob.update({
        where: { id: jobId },
        data: {
          progress,
          totalGenerated,
        },
      });
    }

    // Mark job as completed
    await prisma.questionGenerationJob.update({
      where: { id: jobId },
      data: {
        status: "completed",
        completedAt: new Date(),
        progress: 100,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    await prisma.questionGenerationJob.update({
      where: { id: jobId },
      data: {
        status: "failed",
        errorMessage,
      },
    });
    throw error;
  }
}

/**
 * Generate questions for a specific chapter
 */
async function generateQuestionsForChapter(params: {
  chapterId: string;
  count: number;
  difficulty?: "easy" | "medium" | "hard";
  sourceContent?: string;
}): Promise<GeneratedQuestion[]> {
  const { chapterId, count, difficulty, sourceContent } = params;

  // Get chapter details
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: { subject: true },
  });

  if (!chapter) {
    throw new Error("Chapter not found");
  }

  const prompt = `You are an expert commerce education content creator. Generate ${count} high-quality multiple-choice questions.

Subject: ${chapter.subject.name}
Chapter: ${chapter.name}
${difficulty ? `Difficulty: ${difficulty}` : "Difficulty: Mix of easy, medium, and hard"}
${sourceContent ? `Source Content:\n${sourceContent}` : ""}

Requirements:
1. Each question must have exactly 4 options (A, B, C, D)
2. Questions should be relevant to the chapter and curriculum
3. Include detailed, educational explanations
4. Ensure variety in question types (conceptual, application, analytical)
5. Questions should be clear, unambiguous, and exam-focused
6. ${difficulty ? `Maintain ${difficulty} difficulty level` : "Vary difficulty levels"}
7. Return ONLY valid JSON, no markdown or extra text

Return format (JSON array):
[
  {
    "questionText": "Clear, specific question text?",
    "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
    "correctAnswer": "Option A text",
    "explanation": "Detailed explanation covering why this is correct and why others are wrong",
    "difficulty": "easy" | "medium" | "hard",
    "tags": ["topic1", "topic2"],
    "qualityScore": 0.85
  }
]

Important: 
- Question text must end with a question mark
- Options must be distinct and plausible
- Correct answer must exactly match one option
- Explanation should be 2-4 sentences
- Quality score should be 0.7-1.0 based on your assessment`;

  const content = await generateChatCompletion({
    prompt,
    systemPrompt:
      "You are an expert commerce education content creator. Generate high-quality, curriculum-aligned questions. Always return valid JSON only.",
    temperature: 0.8, // Higher temperature for variety
    jsonMode: true,
    maxTokens: count * 300, // Estimate tokens per question
  });

  let parsed;
  try {
    parsed = JSON.parse(content);
    const questions = Array.isArray(parsed) ? parsed : parsed.questions || [parsed];

    // Validate generated questions
    const validatedQuestions = await Promise.all(
      questions.map((q: unknown) => validateGeneratedQuestion(q as GeneratedQuestion, chapterId))
    );

    return validatedQuestions.filter((q): q is GeneratedQuestion => q !== null);
  } catch (error) {
    console.error("Failed to parse AI response:", content);
    throw new Error("Invalid AI response format");
  }
}

/**
 * Validate a generated question
 */
async function validateGeneratedQuestion(question: GeneratedQuestion, chapterId: string): Promise<GeneratedQuestion | null> {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Check question text
  if (!question.questionText || question.questionText.length < 10) {
    issues.push("Question text too short");
  }
  if (!question.questionText?.endsWith("?")) {
    suggestions.push("Question should end with a question mark");
  }

  // Check options
  if (!Array.isArray(question.options) || question.options.length !== 4) {
    issues.push("Must have exactly 4 options");
    return null;
  }

  // Check if options are distinct
  const uniqueOptions = new Set(question.options);
  if (uniqueOptions.size !== 4) {
    issues.push("Options must be distinct");
    return null;
  }

  // Check correct answer
  if (!question.options.includes(question.correctAnswer)) {
    issues.push("Correct answer must match one of the options");
    return null;
  }

  // Check explanation
  if (!question.explanation || (question.explanation && question.explanation.length < 20)) {
    suggestions.push("Explanation should be more detailed");
  }

  // Check for duplicates
  const duplicateCheck = await checkForDuplicateQuestion(
    question.questionText,
    chapterId
  );
  if (duplicateCheck.isDuplicate) {
    issues.push("Similar question already exists");
  }

  // Calculate quality score if not provided
  if (!question.qualityScore) {
    question.qualityScore = calculateQualityScore(question, issues, suggestions);
  }

  // Store validation result
  await prisma.questionValidation.create({
    data: {
      questionId: chapterId, // Temporary, will be updated with actual question ID
      questionType: "generated",
      validationType: "ai_check",
      status: issues.length === 0 ? "passed" : issues.length > 2 ? "failed" : "warning",
      score: question.qualityScore,
      issues,
      suggestions,
      validatedBy: "ai",
    },
  });

  // Return null if critical issues
  if (issues.length > 2) {
    return null;
  }

  return question;
}

/**
 * Check for duplicate questions
 */
async function checkForDuplicateQuestion(
  questionText: string,
  chapterId: string
): Promise<{ isDuplicate: boolean; similarity?: number }> {
  // Simple duplicate check using exact match and similar text
  const normalizedText = questionText.toLowerCase().trim();

  const existingQuestions = await prisma.question.findMany({
    where: { chapterId },
    select: { questionText: true },
  });

  for (const existing of existingQuestions) {
    const existingNormalized = existing.questionText.toLowerCase().trim();

    // Exact match
    if (normalizedText === existingNormalized) {
      return { isDuplicate: true, similarity: 1.0 };
    }

    // High similarity (simple word overlap check)
    const similarity = calculateTextSimilarity(normalizedText, existingNormalized);
    if (similarity > 0.8) {
      return { isDuplicate: true, similarity };
    }
  }

  return { isDuplicate: false };
}

/**
 * Calculate text similarity (simple word overlap)
 */
function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.split(/\s+/));
  const words2 = new Set(text2.split(/\s+/));

  const intersection = new Set([...words1].filter((w) => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

/**
 * Calculate quality score for a question
 */
function calculateQualityScore(
  question: GeneratedQuestion,
  issues: string[],
  suggestions: string[]
): number {
  let score = 1.0;

  // Deduct for issues
  score -= issues.length * 0.15;

  // Deduct for suggestions
  score -= suggestions.length * 0.05;

  // Question length factor
  if (question.questionText.length < 20) {
    score -= 0.1;
  }

  // Explanation length factor
  if (question.explanation && question.explanation.length < 50) {
    score -= 0.1;
  }

  return Math.max(0.3, Math.min(1.0, score));
}

/**
 * Review and approve/reject generated questions
 */
export async function reviewGeneratedQuestion(params: {
  questionId: string;
  adminId: string;
  action: "approve" | "reject" | "needs_revision";
  reviewNotes?: string;
}) {
  const { questionId, adminId, action, reviewNotes } = params;

  const question = await prisma.generatedQuestion.findUnique({
    where: { id: questionId },
  });

  if (!question) {
    throw new Error("Question not found");
  }

  // Update question status
  const updatedQuestion = await prisma.generatedQuestion.update({
    where: { id: questionId },
    data: {
      status: action === "approve" ? "approved" : action === "reject" ? "rejected" : "needs_revision",
      reviewNotes,
      reviewedBy: adminId,
      reviewedAt: new Date(),
      ...(action === "approve" && {
        approvedAt: new Date(),
      }),
    },
  });

  // If approved, create actual question in Question table
  if (action === "approve") {
    const finalQuestion = await prisma.question.create({
      data: {
        chapterId: question.chapterId,
        questionText: question.questionText,
        options: question.options as any,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation || undefined,
        difficulty: question.difficulty,
      },
    });

    // Update generated question with final question ID
    await prisma.generatedQuestion.update({
      where: { id: questionId },
      data: {
        finalQuestionId: finalQuestion.id,
      },
    });

    // Update job stats
    await updateJobStats(question.jobId, action);

    return { success: true, finalQuestion };
  }

  // Update job stats for rejection
  await updateJobStats(question.jobId, action);

  return { success: true };
}

/**
 * Update job statistics
 */
async function updateJobStats(
  jobId: string,
  action: "approve" | "reject" | "needs_revision"
) {
  const job = await prisma.questionGenerationJob.findUnique({
    where: { id: jobId },
  });

  if (!job) return;

  const updates: { totalApproved?: number; totalRejected?: number } = {};

  if (action === "approve") {
    updates.totalApproved = job.totalApproved + 1;
  } else if (action === "reject") {
    updates.totalRejected = job.totalRejected + 1;
  }

  await prisma.questionGenerationJob.update({
    where: { id: jobId },
    data: updates,
  });
}

/**
 * Get generated questions for review
 */
export async function getGeneratedQuestionsForReview(params: {
  jobId?: string;
  status?: "pending_review" | "approved" | "rejected" | "needs_revision";
  page?: number;
  limit?: number;
}) {
  const { jobId, status = "pending_review", page = 1, limit = 20 } = params;

  const questions = await prisma.generatedQuestion.findMany({
    where: {
      ...(jobId && { jobId }),
      status,
    },
    include: {
      job: {
        select: {
          adminName: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  const total = await prisma.generatedQuestion.count({
    where: {
      ...(jobId && { jobId }),
      status,
    },
  });

  return {
    questions,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get question generation jobs
 */
export async function getQuestionGenerationJobs(params: {
  adminId?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const { adminId, status, page = 1, limit = 20 } = params;

  const jobs = await prisma.questionGenerationJob.findMany({
    where: {
      ...(adminId && { adminId }),
      ...(status && { status }),
    },
    include: {
      _count: {
        select: { questions: true },
      },
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  const total = await prisma.questionGenerationJob.count({
    where: {
      ...(adminId && { adminId }),
      ...(status && { status }),
    },
  });

  return {
    jobs,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Batch approve questions
 */
export async function batchApproveQuestions(params: {
  questionIds: string[];
  adminId: string;
}) {
  const { questionIds, adminId } = params;

  const results = await Promise.all(
    questionIds.map((id) =>
      reviewGeneratedQuestion({
        questionId: id,
        adminId,
        action: "approve",
      })
    )
  );

  return {
    success: true,
    approved: results.filter((r) => r.success).length,
    total: questionIds.length,
  };
}
