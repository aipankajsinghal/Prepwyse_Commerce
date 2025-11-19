import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, unauthorizedError, notFoundError, validationError } from "@/lib/api-error-handler";

// POST /api/study-notes/bookmarks - Bookmark/unbookmark a note
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return unauthorizedError();

    const { noteId } = await request.json();

    if (!noteId) {
      return validationError("Note ID is required");
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) return notFoundError("User not found");

    // Check if note exists
    const note = await prisma.studyNote.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      return notFoundError("Study note not found");
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
    return handleApiError(error, "Failed to bookmark study note");
  }
}

// GET /api/study-notes/bookmarks - Get user's bookmarked notes
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return unauthorizedError();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) return notFoundError("User not found");

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
    return handleApiError(error, "Failed to fetch bookmarked notes");
  }
}
