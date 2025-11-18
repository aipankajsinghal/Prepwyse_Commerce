import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/prisma";

// GET /api/study-notes/chapters/[chapterId] - List notes for a chapter
export async function GET(
  request: Request,
  { params }: { params: { chapterId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get notes for the chapter
    const [notes, total] = await Promise.all([
      prisma.studyNote.findMany({
        where: {
          chapterId: params.chapterId,
          isPublished: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          summary: true,
          type: true,
          difficulty: true,
          tags: true,
          views: true,
          likes: true,
          createdAt: true,
          updatedAt: true,
          bookmarks: {
            where: { userId: user.id },
            select: { id: true },
          },
        },
      }),
      prisma.studyNote.count({
        where: {
          chapterId: params.chapterId,
          isPublished: true,
        },
      }),
    ]);

    // Add isBookmarked field
    const notesWithBookmark = notes.map((note) => ({
      ...note,
      isBookmarked: note.bookmarks.length > 0,
      bookmarks: undefined,
    }));

    return NextResponse.json({
      notes: notesWithBookmark,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching study notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch study notes" },
      { status: 500 }
    );
  }
}
