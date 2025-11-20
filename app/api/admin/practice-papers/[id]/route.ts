/**
 * Admin API: Practice Papers Management (Dynamic ID Routes)
 * Phase D: Advanced Features
 * 
 * Refactored to use withAdminAuthParams pattern for cleaner code.
 * See REFACTORING_OPTIONS.md for details on this pattern.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuthParams } from "@/lib/auth/withAdminAuth";

// PATCH /api/admin/practice-papers/[id] - Update practice paper (admin only)
export const PATCH = withAdminAuthParams(async (req, { user, params }) => {
  if (!params?.id) {
    return NextResponse.json({ error: "Practice paper ID is required" }, { status: 400 });
  }
  const { id } = params;
  const data = await req.json();
  const {
    year,
    examType,
    title,
    description,
    duration,
    totalMarks,
    subjectId,
    questions,
    solutions,
    difficulty,
  } = data;

  // Check if paper exists
  const existingPaper = await prisma.practicePaper.findUnique({
    where: { id },
  });

  if (!existingPaper) {
    return NextResponse.json(
      { error: "Practice paper not found" },
      { status: 404 }
    );
  }

  // Update practice paper
  const paper = await prisma.practicePaper.update({
    where: { id },
    data: {
      ...(year && { year: parseInt(year) }),
      ...(examType && { examType }),
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(duration && { duration: parseInt(duration) }),
      ...(totalMarks && { totalMarks: parseInt(totalMarks) }),
      ...(subjectId !== undefined && { subjectId }),
      ...(questions && { questions }),
      ...(solutions !== undefined && { solutions }),
      ...(difficulty && { difficulty }),
    },
  });

  return NextResponse.json({ paper });
});

// DELETE /api/admin/practice-papers/[id] - Delete practice paper (admin only)
export const DELETE = withAdminAuthParams(async (req, { user, params }) => {
  if (!params?.id) {
    return NextResponse.json({ error: "Practice paper ID is required" }, { status: 400 });
  }
  const { id } = params;

  // Check if paper exists
  const existingPaper = await prisma.practicePaper.findUnique({
    where: { id },
  });

  if (!existingPaper) {
    return NextResponse.json(
      { error: "Practice paper not found" },
      { status: 404 }
    );
  }

  // Delete practice paper (cascade will delete attempts)
  await prisma.practicePaper.delete({
    where: { id },
  });

  return NextResponse.json({ message: "Practice paper deleted successfully" });
});
