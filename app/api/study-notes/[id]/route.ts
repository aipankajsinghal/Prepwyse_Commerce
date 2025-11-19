import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, unauthorizedError, notFoundError, forbiddenError } from "@/lib/api-error-handler";


type RouteParams = {
  params: Promise<{ id: string }>;
};

// GET /api/study-notes/[id] - Get a specific study note
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { userId } = await auth();
    if (!userId) return unauthorizedError();

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) return notFoundError("User not found");

    const { id } = await params;

    // Get note
    const note = await prisma.studyNote.findUnique({
      where: { id },
      include: {
        bookmarks: {
          where: { userId: user.id },
          select: { id: true },
        },
      },
    });

    if (!note) return notFoundError("Study note not found");

    if (!note.isPublished) return forbiddenError("Study note not available");

    // Increment views
    await prisma.studyNote.update({
      where: { id },
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
    return handleApiError(error, "Failed to fetch study note");
  }
}
