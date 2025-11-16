import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { generateAIQuestions, determineAdaptiveDifficulty } from "@/lib/ai-services";

// POST /api/ai/generate-quiz - Generate AI-powered quiz
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subjectId, chapterIds, questionCount, difficulty: requestedDifficulty } =
      await request.json();

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
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    // Determine adaptive difficulty if not specified
    const difficulty = requestedDifficulty || await determineAdaptiveDifficulty(userId);

    // Ensure user exists in database
    const dbUser = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: {
        clerkId: userId,
        email: "", // Will be updated by user sync
      },
    });

    // Generate AI questions
    const aiQuestions = await generateAIQuestions({
      subjectName: subject.name,
      chapterNames: subject.chapters.map(c => c.name),
      questionCount,
      difficulty,
      userId: dbUser.id,
    });

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
        questionCount,
        duration: questionCount * 2, // 2 minutes per question
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
      quizAttempt,
      questions: storedQuestions,
      adaptiveDifficulty: difficulty,
      message: `Generated ${storedQuestions.length} AI-powered questions at ${difficulty} difficulty`,
    });
  } catch (error: any) {
    console.error("Error generating AI quiz:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate AI quiz" },
      { status: 500 }
    );
  }
}
