import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { generateAIMockTest } from "@/lib/ai-services";
import { handleApiError, unauthorizedError } from "@/lib/api-error-handler";

// POST /api/ai/generate-mock-test - Generate AI-powered mock test
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return unauthorizedError();
    }

    const body = await request.json();
    const { title, examType, description, duration, totalQuestions, sections } = body;

    // Validate input
    if (!title || !examType || !duration || !totalQuestions || !sections) {
      return NextResponse.json(
        { error: "Invalid input", details: "All fields are required: title, examType, duration, totalQuestions, sections" },
        { status: 400 }
      );
    }

    if (!Array.isArray(sections) || sections.length === 0) {
      return NextResponse.json(
        { error: "Invalid sections", details: "Sections must be a non-empty array" },
        { status: 400 }
      );
    }

    // Validate total questions matches sum of section questions
    const sectionTotal = sections.reduce((sum, s) => sum + (s.questions || 0), 0);
    if (sectionTotal !== totalQuestions) {
      return NextResponse.json(
        { 
          error: "Question count mismatch", 
          details: `Total questions (${totalQuestions}) must equal sum of section questions (${sectionTotal})` 
        },
        { status: 400 }
      );
    }

    // Generate AI mock test with questions
    let aiResult;
    try {
      aiResult = await generateAIMockTest({
        title,
        examType,
        description,
        duration,
        totalQuestions,
        sections,
      });
    } catch (aiError: unknown) {
      const errorMessage = aiError instanceof Error ? aiError.message : "Unknown error";
      console.error("AI generation error:", errorMessage);
      return NextResponse.json(
        { 
          error: "AI generation failed", 
          details: `Could not generate mock test: ${errorMessage}`
        },
        { status: 503 }
      );
    }

    if (!aiResult || !aiResult.mockTest || !aiResult.sections) {
      return NextResponse.json(
        { error: "Invalid AI response", details: "AI did not return valid mock test data" },
        { status: 500 }
      );
    }

    // Store mock test in database
    const mockTest = await prisma.mockTest.create({
      data: {
        title: aiResult.mockTest.title,
        examType: aiResult.mockTest.examType,
        description: aiResult.mockTest.description,
        duration: aiResult.mockTest.duration,
        totalQuestions: aiResult.mockTest.totalQuestions,
        sections: sections, // Store original section structure
      },
    });

    // Store all generated questions
    const allQuestions: any[] = [];
    let questionNumber = 1;

    for (const section of aiResult.sections) {
      if (!section.questions || !Array.isArray(section.questions)) {
        continue;
      }

      for (const question of section.questions) {
        allQuestions.push({
          mockTestId: mockTest.id,
          questionNumber,
          section: section.name,
          questionText: question.questionText,
          options: question.options,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          difficulty: question.difficulty || "medium",
        });
        questionNumber++;
      }
    }

    // Note: We would need to create a MockTestQuestion model to store these
    // For now, we'll return them for the client to use
    
    return NextResponse.json({
      mockTestId: mockTest.id,
      mockTest,
      questions: allQuestions,
      message: "AI mock test generated successfully",
      questionsGenerated: allQuestions.length,
    });
  } catch (error) {
    return handleApiError(error, "Failed to generate AI mock test");
  }
}
