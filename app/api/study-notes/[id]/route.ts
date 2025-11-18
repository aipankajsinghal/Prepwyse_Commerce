import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/prisma";

// GET /api/study-notes/[id] - Get a specific study note
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get note
    const note = await prisma.studyNote.findUnique({
      where: { id: params.id },
      include: {
        bookmarks: {
          where: { userId: user.id },
          select: { id: true },
        },
      },
    });

    if (!note) {
      return NextResponse.json(
        { error: "Study note not found" },
        { status: 404 }
      );
    }

    if (!note.isPublished) {
      return NextResponse.json(
        { error: "Study note not available" },
        { status: 403 }
      );
    }

    // Increment views
    await prisma.studyNote.update({
      where: { id: params.id },
      data: { views: { increment: 1 } },
    });

    // Return note with bookmark status
    const noteWithBookmark = {
      ...note,
      isBookmarked: note.bookmarks.length > 0,
      bookmarks: undefined,
      views: note.views + 1, // Include incremented view count
    };

    return NextResponse.json({ note: noteWithBookmark });
  } catch (error) {
    console.error("Error fetching study note:", error);
    return NextResponse.json(
      { error: "Failed to fetch study note" },
      { status: 500 }
    );
  }
}
