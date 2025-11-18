import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET /api/search - Unified search across platform
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const type = searchParams.get("type"); // "all", "questions", "notes", "papers", "chapters"
    const difficulty = searchParams.get("difficulty");
    const subjectId = searchParams.get("subjectId");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: "Search query must be at least 2 characters" },
        { status: 400 }
      );
    }

    const searchTerm = query.trim().toLowerCase();

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const results: any = {
      query,
      total: 0,
      chapters: [],
      questions: [],
      notes: [],
      papers: [],
    };

    // Search Chapters
    if (!type || type === "all" || type === "chapters") {
      const chapters = await prisma.chapter.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: "insensitive" } },
            { description: { contains: searchTerm, mode: "insensitive" } },
          ],
          ...(subjectId && { subjectId }),
        },
        take: limit,
        include: {
          subject: {
            select: { name: true },
          },
        },
      });
      results.chapters = chapters;
      results.total += chapters.length;
    }

    // Search Questions (search in question text)
    if (!type || type === "all" || type === "questions") {
      const questions = await prisma.question.findMany({
        where: {
          questionText: { contains: searchTerm, mode: "insensitive" },
          ...(difficulty && { difficulty }),
          ...(subjectId && {
            chapter: { subjectId },
          }),
        },
        take: limit,
        include: {
          chapter: {
            select: {
              name: true,
              subject: { select: { name: true } },
            },
          },
        },
      });
      results.questions = questions;
      results.total += questions.length;
    }

    // Search Study Notes
    if (!type || type === "all" || type === "notes") {
      const notes = await prisma.studyNote.findMany({
        where: {
          isPublished: true,
          OR: [
            { title: { contains: searchTerm, mode: "insensitive" } },
            { content: { contains: searchTerm, mode: "insensitive" } },
            { summary: { contains: searchTerm, mode: "insensitive" } },
          ],
          ...(difficulty && { difficulty }),
        },
        take: limit,
        select: {
          id: true,
          chapterId: true,
          title: true,
          summary: true,
          type: true,
          difficulty: true,
          views: true,
          likes: true,
          createdAt: true,
        },
      });
      results.notes = notes;
      results.total += notes.length;
    }

    // Search Practice Papers
    if (!type || type === "all" || type === "papers") {
      const papers = await prisma.practicePaper.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm, mode: "insensitive" } },
            { description: { contains: searchTerm, mode: "insensitive" } },
          ],
          ...(difficulty && { difficulty }),
        },
        take: limit,
        select: {
          id: true,
          year: true,
          examType: true,
          title: true,
          description: true,
          duration: true,
          totalMarks: true,
          difficulty: true,
        },
      });
      results.papers = papers;
      results.total += papers.length;
    }

    // Save search history
    try {
      await prisma.searchHistory.create({
        data: {
          userId: user.id,
          query: searchTerm,
          resultCount: results.total,
          filters: {
            type,
            difficulty,
            subjectId,
          },
        },
      });
    } catch (error) {
      // Non-critical error, just log it
      console.error("Error saving search history:", error);
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error performing search:", error);
    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: 500 }
    );
  }
}
