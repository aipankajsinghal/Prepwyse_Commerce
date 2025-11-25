/**
 * Admin API: Individual Chapter Management
 * Update and delete chapters
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuthParams } from "@/lib/auth/withAdminAuth";

/**
 * PATCH /api/admin/chapters/[chapterId]
 * Update a chapter
 */
export const PATCH = withAdminAuthParams(async (req: NextRequest, { user, params }) => {
  if (!params?.chapterId) {
    return NextResponse.json(
      { error: "Chapter ID is required" },
      { status: 400 }
    );
  }
  const { chapterId } = params;
  const data = await req.json();

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: { subject: true },
  });

  if (!chapter) {
    return NextResponse.json(
      { error: "Chapter not found" },
      { status: 404 }
    );
  }

  const updatedChapter = await prisma.chapter.update({
    where: { id: chapterId },
    data: {
      name: data.name,
      description: data.description,
      order: data.order,
    },
    include: {
      subject: true,
    },
  });

  // Log admin activity
  await prisma.adminActivity.create({
    data: {
      adminId: user.clerkId,
      adminName: user.name || user.email,
      action: "update",
      resourceType: "chapter",
      resourceId: chapterId,
      description: `Updated chapter: ${updatedChapter.name}`,
      metadata: {
        previousName: chapter.name,
        newName: updatedChapter.name,
        subjectName: chapter.subject.name,
      },
    },
  });

  return NextResponse.json({ chapter: updatedChapter });
});

/**
 * DELETE /api/admin/chapters/[chapterId]
 * Delete a chapter (will cascade delete questions)
 */
export const DELETE = withAdminAuthParams(async (req: NextRequest, { user, params }) => {
  if (!params?.chapterId) {
    return NextResponse.json(
      { error: "Chapter ID is required" },
      { status: 400 }
    );
  }
  const { chapterId } = params;

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: {
      subject: true,
      _count: {
        select: { questions: true },
      },
    },
  });

  if (!chapter) {
    return NextResponse.json(
      { error: "Chapter not found" },
      { status: 404 }
    );
  }

  await prisma.chapter.delete({
    where: { id: chapterId },
  });

  // Log admin activity
  await prisma.adminActivity.create({
    data: {
      adminId: user.clerkId,
      adminName: user.name || user.email,
      action: "delete",
      resourceType: "chapter",
      resourceId: chapterId,
      description: `Deleted chapter: ${chapter.name} from ${chapter.subject.name}`,
      metadata: {
        chapterName: chapter.name,
        subjectName: chapter.subject.name,
        questionsDeleted: chapter._count.questions,
      },
    },
  });

  return NextResponse.json({
    success: true,
    message: "Chapter deleted successfully",
  });
});
