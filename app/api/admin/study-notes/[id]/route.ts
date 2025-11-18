import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/prisma";

// Helper to check if user is admin
async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });
  const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];
  return user ? adminEmails.includes(user.email) : false;
}

// PATCH /api/admin/study-notes/[id] - Update study note (admin only)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isAdmin(userId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await request.json();
    const {
      title,
      content,
      summary,
      type,
      difficulty,
      tags,
      pdfUrl,
      isPublished,
    } = data;

    // Check if note exists
    const existingNote = await prisma.studyNote.findUnique({
      where: { id: params.id },
    });

    if (!existingNote) {
      return NextResponse.json(
        { error: "Study note not found" },
        { status: 404 }
      );
    }

    // Update study note
    const note = await prisma.studyNote.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(summary !== undefined && { summary }),
        ...(type && { type }),
        ...(difficulty && { difficulty }),
        ...(tags !== undefined && { tags }),
        ...(pdfUrl !== undefined && { pdfUrl }),
        ...(isPublished !== undefined && { isPublished }),
      },
    });

    return NextResponse.json({ note });
  } catch (error) {
    console.error("Error updating study note:", error);
    return NextResponse.json(
      { error: "Failed to update study note" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/study-notes/[id] - Delete study note (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isAdmin(userId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if note exists
    const existingNote = await prisma.studyNote.findUnique({
      where: { id: params.id },
    });

    if (!existingNote) {
      return NextResponse.json(
        { error: "Study note not found" },
        { status: 404 }
      );
    }

    // Delete study note (cascade will delete bookmarks)
    await prisma.studyNote.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Study note deleted successfully" });
  } catch (error) {
    console.error("Error deleting study note:", error);
    return NextResponse.json(
      { error: "Failed to delete study note" },
      { status: 500 }
    );
  }
}
