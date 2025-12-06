import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAIQuestions, determineAdaptiveDifficulty } from "@/lib/ai-services";
import { handleApiError, notFoundError } from "@/lib/api-error-handler";
import { requireUser } from "@/lib/auth/requireUser";
import { withRedisRateLimit, aiRateLimit } from "@/lib/middleware/redis-rateLimit";

// POST /api/ai/generate-quiz - Generate AI-powered quiz
async function handler(request: NextRequest) {
  try {
    const dbUser = await requireUser(request);
    const userId = dbUser.clerkId;

    const body = await request.json();
    const { subjectId, chapterIds, questionCount, difficulty: requestedDifficulty } = body;

    // Validate input
    if (!subjectId || !chapterIds || !Array.isArray(chapterIds) || chapterIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid input", details: "Please select a subject and at least one chapter" },
        { status: 400 }
      );
    }

    if (!questionCount || questionCount < 1) {
      return NextResponse.json(
        { error: "Invalid input", details: "Question count must be at least 1" },
        { status: 400 }
      );
    }

    // Get subject and chapter names for AI context
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        chapters: {
          where: {
            id: { in: chapterIds },
          },
        },
      },
    });

    if (!subject) {
      return notFoundError("Subject");
    }

    if (subject.chapters.length === 0) {
      return NextResponse.json(
        { error: "Invalid chapters", details: "No valid chapters found for selected IDs" },
        { status: 404 }
      );
    }

    // Determine adaptive difficulty if not specified
    const difficulty = requestedDifficulty || await determineAdaptiveDifficulty(userId);

    // Generate AI questions
    let aiQuestions;
    try {
      aiQuestions = await generateAIQuestions({
        subjectName: subject.name,
        chapterNames: subject.chapters.map(c => c.name),
        questionCount,
        difficulty,
        userId: dbUser.id,
      });
    } catch (aiError: any) {
      console.error("AI generation error:", aiError);
      return NextResponse.json(
        { 
          error: "AI generation failed", 
          details: aiError.message || "Could not generate questions. Please check if AI API keys are configured correctly."
        },
        { status: 503 }
      );
    }

    if (!aiQuestions || aiQuestions.length === 0) {
      return NextResponse.json(
        { error: "No questions generated", details: "AI did not generate any questions. Please try again." },
        { status: 500 }
      );
    }

    // Store questions in database
    const storedQuestions = await Promise.all(
      aiQuestions.map(async (q: any, index: number) => {
        // Use first chapter for storage, or distribute across chapters
        const chapterId = chapterIds[index % chapterIds.length];
        
        return await prisma.question.create({
          data: {
            chapterId,
            questionText: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            difficulty: q.difficulty || difficulty,
          },
        });
      })
    );

    // Create quiz record
    const quiz = await prisma.quiz.create({
      data: {
        title: `AI-Generated Quiz: ${subject.name}`,
        description: `Adaptive ${difficulty} level quiz`,
        subjectId,
        chapterIds,
        questionCount: storedQuestions.length,
        duration: storedQuestions.length * 2, // 2 minutes per question
      },
    });

    // Create quiz attempt
    const quizAttempt = await prisma.quizAttempt.create({
      data: {
        userId: dbUser.id,
        quizId: quiz.id,
        totalQuestions: storedQuestions.length,
        answers: [],
      },
    });

    return NextResponse.json({
      quizId: quiz.id,
      quizAttempt,
      questions: storedQuestions,
      adaptiveDifficulty: difficulty,
      message: `Generated ${storedQuestions.length} AI-powered questions at ${difficulty} difficulty`,
    });
  } catch (error: any) {
    console.error("Quiz generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate AI quiz",
        details: error.message || "An unexpected error occurred. Please try again."
      },
      { status: 500 }
    );
  }
}

// Apply rate limiting: 5 requests per hour
export const POST = withRedisRateLimit(handler, aiRateLimit);
