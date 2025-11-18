import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/prisma";

// POST /api/practice-papers/attempt - Start a new practice paper attempt
export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { paperId } = await request.json();

    if (!paperId) {
      return NextResponse.json(
        { error: "Paper ID is required" },
        { status: 400 }
      );
    }

    // Get paper details
    const paper = await prisma.practicePaper.findUnique({
      where: { id: paperId },
    });

    if (!paper) {
      return NextResponse.json(
        { error: "Practice paper not found" },
        { status: 404 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse questions to get count
    const questions = paper.questions as any[];
    const totalQuestions = Array.isArray(questions) ? questions.length : 0;

    // Create attempt
    const attempt = await prisma.practicePaperAttempt.create({
      data: {
        userId: user.id,
        paperId: paper.id,
        totalQuestions,
        totalMarks: paper.totalMarks,
        answers: [],
      },
    });

    return NextResponse.json({ attempt, paper }, { status: 201 });
  } catch (error) {
    console.error("Error starting practice paper attempt:", error);
    return NextResponse.json(
      { error: "Failed to start practice paper attempt" },
      { status: 500 }
    );
  }
}
