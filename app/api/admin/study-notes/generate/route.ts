/**
 * Admin API: AI Study Notes Generation
 * Phase D: Advanced Features
 * 
 * Refactored to use withAdminAuth pattern for cleaner code.
 * See REFACTORING_OPTIONS.md for details on this pattern.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";
import OpenAI from "openai";

// POST /api/admin/study-notes/generate - AI generate study note (admin only)
export const POST = withAdminAuth(async (req, { user }) => {
  const data = await req.json();
    const { chapterId, chapterName, subjectName, difficulty } = data;

    // Validate required fields
    if (!chapterId || !chapterName || !subjectName) {
      return NextResponse.json(
        { error: "Chapter ID, chapter name, and subject name are required" },
        { status: 400 }
      );
    }

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Generate study note using AI
    const prompt = `Create comprehensive study notes for commerce students on the following topic:

Subject: ${subjectName}
Chapter: ${chapterName}
Difficulty Level: ${difficulty || "medium"}

Please provide:
1. A detailed explanation of key concepts
2. Important definitions and terms
3. Key points to remember
4. Examples where applicable
5. Tips for exam preparation

Format the content in a clear, structured manner suitable for student learning. Use markdown formatting for headings and bullet points.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an experienced commerce teacher creating study notes for Class 11, 12, and CUET students in India. Your notes should be comprehensive, clear, and exam-focused.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const generatedContent = completion.choices[0]?.message?.content || "";

    if (!generatedContent) {
      return NextResponse.json(
        { error: "Failed to generate content" },
        { status: 500 }
      );
    }

    // Generate summary
    const summaryPrompt = `Provide a brief 2-3 sentence summary of the following study notes:\n\n${generatedContent.substring(0, 1000)}`;

    const summaryCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that creates concise summaries.",
        },
        {
          role: "user",
          content: summaryPrompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 200,
    });

    const generatedSummary =
      summaryCompletion.choices[0]?.message?.content || "";

  // Create the study note
  const note = await prisma.studyNote.create({
    data: {
      chapterId,
      title: `${chapterName} - Study Notes`,
      content: generatedContent,
      summary: generatedSummary,
      type: "ai_generated",
      authorId: user.id,
      difficulty: difficulty || "medium",
      isPublished: false, // Admin should review before publishing
    },
  });

  return NextResponse.json(
    {
      note,
      message:
        "Study note generated successfully. Please review before publishing.",
    },
    { status: 201 }
  );
});
