/**
 * Admin API: AI-Generated Mock Tests
 * Generate mock tests using AI based on subject and chapter selection
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";
import { generateAIContent } from "@/lib/ai-provider";

/**
 * POST /api/admin/mock-tests/generate
 * Generate a mock test using AI
 */
export const POST = withAdminAuth(async (req: NextRequest, { user }) => {
  const data = await req.json();
  const {
    title,
    description,
    examType,
    subjectIds,
    chapterIds,
    questionCount,
    duration,
    difficulty,
  } = data;

  // Validate required fields
  if (!title || !examType || !questionCount || !duration) {
    return NextResponse.json(
      { error: "Title, exam type, question count, and duration are required" },
      { status: 400 }
    );
  }

  if (!chapterIds || chapterIds.length === 0) {
    return NextResponse.json(
      { error: "At least one chapter must be selected" },
      { status: 400 }
    );
  }

  try {
    // Fetch chapters with their subjects
    const chapters = await prisma.chapter.findMany({
      where: {
        id: { in: chapterIds },
      },
      include: {
        subject: true,
      },
    });

    if (chapters.length === 0) {
      return NextResponse.json(
        { error: "No valid chapters found" },
        { status: 404 }
      );
    }

    // Group chapters by subject
    const chaptersBySubject: Record<string, any[]> = {};
    chapters.forEach((chapter) => {
      const subjectName = chapter.subject.name;
      if (!chaptersBySubject[subjectName]) {
        chaptersBySubject[subjectName] = [];
      }
      chaptersBySubject[subjectName].push(chapter);
    });

    // Generate questions using AI
    const prompt = `Generate ${questionCount} multiple-choice questions for a ${examType} mock test with the following specifications:

Exam Type: ${examType}
Difficulty Level: ${difficulty || "mixed"}
Subjects and Chapters:
${Object.entries(chaptersBySubject)
  .map(
    ([subject, chaps]) =>
      `- ${subject}: ${chaps.map((c) => c.name).join(", ")}`
  )
  .join("\n")}

For each question, provide:
1. Question text (clear and commerce-focused)
2. Four options (A, B, C, D)
3. Correct answer
4. Brief explanation

Format the response as a JSON array with this structure:
[
  {
    "questionText": "...",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "correctAnswer": "A",
    "explanation": "...",
    "difficulty": "easy|medium|hard",
    "chapterId": "select appropriate chapter ID from the list",
    "section": "subject name"
  }
]

Chapter IDs: ${chapters.map((c) => `${c.id}:${c.name}`).join(", ")}`;

    const aiResponse = await generateAIContent(prompt, {
      temperature: 0.7,
      maxTokens: 4000,
    });

    let generatedQuestions;
    try {
      // Try to parse AI response as JSON
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        generatedQuestions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON array found in AI response");
      }
    } catch (parseError) {
      return NextResponse.json(
        { 
          error: "Failed to parse AI-generated questions",
          details: aiResponse.substring(0, 500),
        },
        { status: 500 }
      );
    }

    // Create sections for the mock test
    const sections = Object.entries(chaptersBySubject).map(
      ([subjectName, chaps]) => ({
        name: subjectName,
        chapters: chaps.map((c) => ({ id: c.id, name: c.name })),
      })
    );

    // Create mock test
    const mockTest = await prisma.mockTest.create({
      data: {
        title,
        description: description || `AI-generated ${examType} mock test`,
        examType,
        totalQuestions: questionCount,
        duration,
        sections,
      },
    });

    // Create mock test questions
    const questionPromises = generatedQuestions
      .slice(0, questionCount)
      .map((q: any, index: number) =>
        prisma.mockTestQuestion.create({
          data: {
            mockTestId: mockTest.id,
            questionNumber: index + 1,
            section: q.section || chapters[0].subject.name,
            questionText: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            difficulty: q.difficulty || difficulty || "medium",
          },
        })
      );

    await Promise.all(questionPromises);

    // Log admin activity
    await prisma.adminActivity.create({
      data: {
        adminId: user.clerkId,
        adminName: user.name || user.email,
        action: "create",
        resourceType: "mock_test",
        resourceId: mockTest.id,
        description: `Generated AI mock test: ${title}`,
        metadata: {
          title,
          examType,
          questionCount,
          subjectIds,
          chapterIds,
        },
      },
    });

    return NextResponse.json({
      success: true,
      mockTest: {
        id: mockTest.id,
        title: mockTest.title,
        examType: mockTest.examType,
        totalQuestions: mockTest.totalQuestions,
        duration: mockTest.duration,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error generating mock test:", error);
    return NextResponse.json(
      {
        error: "Failed to generate mock test",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
});
