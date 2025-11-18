import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/prisma";

// POST /api/study-notes/bookmarks - Bookmark/unbookmark a note
export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { noteId } = await request.json();

    if (!noteId) {
      return NextResponse.json(
        { error: "Note ID is required" },
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

    // Check if note exists
    const note = await prisma.studyNote.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      return NextResponse.json(
        { error: "Study note not found" },
        { status: 404 }
      );
    }

    // Check if already bookmarked
    const existingBookmark = await prisma.noteBookmark.findUnique({
      where: {
        userId_noteId: {
          userId: user.id,
          noteId,
        },
      },
    });

    if (existingBookmark) {
      // Unbookmark
      await prisma.noteBookmark.delete({
        where: { id: existingBookmark.id },
      });
      return NextResponse.json({ bookmarked: false });
    } else {
      // Bookmark
      await prisma.noteBookmark.create({
        data: {
          userId: user.id,
          noteId,
        },
      });
      return NextResponse.json({ bookmarked: true }, { status: 201 });
    }
  } catch (error) {
    console.error("Error bookmarking study note:", error);
    return NextResponse.json(
      { error: "Failed to bookmark study note" },
      { status: 500 }
    );
  }
}

// GET /api/study-notes/bookmarks - Get user's bookmarked notes
export async function GET(request: Request) {
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

    // Get bookmarked notes
    const [bookmarks, total] = await Promise.all([
      prisma.noteBookmark.findMany({
        where: { userId: user.id },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          note: {
            select: {
              id: true,
              chapterId: true,
              title: true,
              summary: true,
              type: true,
              difficulty: true,
              tags: true,
              views: true,
              likes: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      }),
      prisma.noteBookmark.count({ where: { userId: user.id } }),
    ]);

    const notes = bookmarks.map((bookmark) => ({
      ...bookmark.note,
      isBookmarked: true,
      bookmarkedAt: bookmark.createdAt,
    }));

    return NextResponse.json({
      notes,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching bookmarked notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookmarked notes" },
      { status: 500 }
    );
  }
}
