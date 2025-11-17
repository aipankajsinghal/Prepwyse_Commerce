import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// POST /api/quiz - Create and start a new quiz
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();

    const { title, description, subjectId, chapterIds, questionCount, duration } =
      await request.json();

    // Ensure user exists in database
    const dbUser = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {
        email: user?.emailAddresses[0].emailAddress || "",
        name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || null,
      },
      create: {
        clerkId: userId,
        email: user?.emailAddresses[0].emailAddress || "",
        name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || null,
      },
    });

    // Create quiz
    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        subjectId,
        chapterIds,
        questionCount,
        duration,
      },
    });

    // Fetch random questions from selected chapters
    const questions = await prisma.question.findMany({
      where: {
        chapterId: {
          in: chapterIds,
        },
      },
      take: questionCount,
    });

    // Create quiz attempt
    const quizAttempt = await prisma.quizAttempt.create({
      data: {
        userId: dbUser.id,
        quizId: quiz.id,
        totalQuestions: questions.length,
        answers: [],
      },
    });

    return NextResponse.json({
      quizId: quiz.id,
      quizAttempt,
      questions,
    });
  } catch (error) {
    console.error("Error creating quiz:", error);
    return NextResponse.json(
      { error: "Failed to create quiz" },
      { status: 500 }
    );
  }
}
