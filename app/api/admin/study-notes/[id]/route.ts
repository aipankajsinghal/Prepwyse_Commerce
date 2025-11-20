/**
 * Admin API: Study Notes Management (Dynamic ID Routes)
 * Phase D: Advanced Features
 * 
 * Refactored to use withAdminAuthParams pattern for cleaner code.
 * See REFACTORING_OPTIONS.md for details on this pattern.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuthParams } from "@/lib/auth/withAdminAuth";

// PATCH /api/admin/study-notes/[id] - Update study note (admin only)
export const PATCH = withAdminAuthParams(async (req, { user, params }) => {
  if (!params?.id) {
    return NextResponse.json({ error: "Study note ID is required" }, { status: 400 });
  }
  const { id } = params;
  const data = await req.json();
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
    where: { id },
  });

  if (!existingNote) {
    return NextResponse.json(
      { error: "Study note not found" },
      { status: 404 }
    );
  }

  // Update study note
  const note = await prisma.studyNote.update({
    where: { id },
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
});

// DELETE /api/admin/study-notes/[id] - Delete study note (admin only)
export const DELETE = withAdminAuthParams(async (req, { user, params }) => {
  if (!params?.id) {
    return NextResponse.json({ error: "Study note ID is required" }, { status: 400 });
  }
  const { id } = params;

  // Check if note exists
  const existingNote = await prisma.studyNote.findUnique({
    where: { id },
  });

  if (!existingNote) {
    return NextResponse.json(
      { error: "Study note not found" },
      { status: 404 }
    );
  }

  // Delete study note (cascade will delete bookmarks)
  await prisma.studyNote.delete({
    where: { id },
  });

  return NextResponse.json({ message: "Study note deleted successfully" });
});
