/**
 * Admin API: Individual Subject Management
 * Update and delete subjects
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuthParams } from "@/lib/auth/withAdminAuth";

/**
 * PATCH /api/admin/subjects/[subjectId]
 * Update a subject
 */
export const PATCH = withAdminAuthParams(async (req: NextRequest, { user, params }) => {
  const { subjectId } = params;
  const data = await req.json();

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
  });

  if (!subject) {
    return NextResponse.json(
      { error: "Subject not found" },
      { status: 404 }
    );
  }

  const updatedSubject = await prisma.subject.update({
    where: { id: subjectId },
    data: {
      name: data.name,
      description: data.description,
      icon: data.icon,
    },
  });

  // Log admin activity
  await prisma.adminActivity.create({
    data: {
      adminId: user.clerkId,
      adminName: user.name || user.email,
      action: "update",
      resourceType: "subject",
      resourceId: subjectId,
      description: `Updated subject: ${updatedSubject.name}`,
      metadata: {
        previousName: subject.name,
        newName: updatedSubject.name,
      },
    },
  });

  return NextResponse.json({ subject: updatedSubject });
});

/**
 * DELETE /api/admin/subjects/[subjectId]
 * Delete a subject (will cascade delete chapters and questions)
 */
export const DELETE = withAdminAuthParams(async (req: NextRequest, { user, params }) => {
  const { subjectId } = params;

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: {
      _count: {
        select: { chapters: true },
      },
    },
  });

  if (!subject) {
    return NextResponse.json(
      { error: "Subject not found" },
      { status: 404 }
    );
  }

  await prisma.subject.delete({
    where: { id: subjectId },
  });

  // Log admin activity
  await prisma.adminActivity.create({
    data: {
      adminId: user.clerkId,
      adminName: user.name || user.email,
      action: "delete",
      resourceType: "subject",
      resourceId: subjectId,
      description: `Deleted subject: ${subject.name}`,
      metadata: {
        subjectName: subject.name,
        chaptersDeleted: subject._count.chapters,
      },
    },
  });

  return NextResponse.json({
    success: true,
    message: "Subject deleted successfully",
  });
});
