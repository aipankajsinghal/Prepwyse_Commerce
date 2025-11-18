import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/prisma";

// POST /api/practice-papers/submit - Submit practice paper attempt
export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { attemptId, answers, timeSpent } = await request.json();

    if (!attemptId || !answers) {
      return NextResponse.json(
        { error: "Attempt ID and answers are required" },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get attempt with paper details
    const attempt = await prisma.practicePaperAttempt.findUnique({
      where: { id: attemptId },
      include: { paper: true },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    if (attempt.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (attempt.completedAt) {
      return NextResponse.json(
        { error: "Attempt already submitted" },
        { status: 400 }
      );
    }

    // Calculate score
    const questions = attempt.paper.questions as any[];
    const solutions = (attempt.paper.solutions as any[]) || [];
    
    let correctAnswers = 0;
    const answersArray = Array.isArray(answers) ? answers : [];

    answersArray.forEach((answer: any) => {
      const question = questions.find((q: any) => q.id === answer.questionId);
      const solution = solutions.find((s: any) => s.questionId === answer.questionId);
      
      if (question && solution && answer.selectedAnswer === solution.correctAnswer) {
        correctAnswers++;
      } else if (question && question.correctAnswer && answer.selectedAnswer === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const totalQuestions = questions.length;
    const marksPerQuestion = attempt.totalMarks / totalQuestions;
    const obtainedMarks = Math.round(correctAnswers * marksPerQuestion);
    const accuracy = (correctAnswers / totalQuestions) * 100;

    // Update attempt
    const updatedAttempt = await prisma.practicePaperAttempt.update({
      where: { id: attemptId },
      data: {
        answers: answersArray,
        score: correctAnswers,
        obtainedMarks,
        accuracy,
        timeSpent,
        completedAt: new Date(),
      },
      include: { paper: true },
    });

    return NextResponse.json({ attempt: updatedAttempt });
  } catch (error) {
    console.error("Error submitting practice paper:", error);
    return NextResponse.json(
      { error: "Failed to submit practice paper" },
      { status: 500 }
    );
  }
}
