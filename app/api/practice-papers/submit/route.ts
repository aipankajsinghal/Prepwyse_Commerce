import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, unauthorizedError, notFoundError, validationError, forbiddenError } from "@/lib/api-error-handler";

// Type definitions for practice paper data
interface PracticeQuestion {
  id: string;
  correctAnswer?: string;
  [key: string]: unknown;
}

interface PracticeSolution {
  questionId: string;
  correctAnswer: string;
  [key: string]: unknown;
}

interface SubmittedAnswer {
  questionId: string;
  selectedAnswer: string;
  [key: string]: unknown;
}

// POST /api/practice-papers/submit - Submit practice paper attempt
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return unauthorizedError();

    const { attemptId, answers, timeSpent } = await request.json();

    if (!attemptId || !answers) {
      return validationError("Attempt ID and answers are required");
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) return notFoundError("User not found");

    // Get attempt with paper details
    const attempt = await prisma.practicePaperAttempt.findUnique({
      where: { id: attemptId },
      include: { paper: true },
    });

    if (!attempt) return notFoundError("Attempt not found");

    if (attempt.userId !== user.id) return forbiddenError();

    if (attempt.completedAt) {
      return validationError("Attempt already submitted");
    }

    // Calculate score
    const questions = attempt.paper.questions as PracticeQuestion[];
    const solutions = (attempt.paper.solutions as PracticeSolution[]) || [];
    
    // Validate questions array is not empty
    if (!questions || questions.length === 0) {
      return validationError("Practice paper has no questions");
    }
    
    let correctAnswers = 0;
    const answersArray = Array.isArray(answers) ? (answers as SubmittedAnswer[]) : [];

    answersArray.forEach((answer: SubmittedAnswer) => {
      const question = questions.find((q: PracticeQuestion) => q.id === answer.questionId);
      const solution = solutions.find((s: PracticeSolution) => s.questionId === answer.questionId);
      
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
        answers: answersArray as unknown as any, // Prisma Json type requires any for dynamic objects
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
    return handleApiError(error, "Failed to submit practice paper");
  }
}
