/**
 * Admin API: Chapters Management
 * CRUD operations for chapters
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

/**
 * GET /api/admin/chapters
 * List chapters with optional subject filter
 */
export const GET = withAdminAuth(async (req: NextRequest, { user }) => {
  const { searchParams } = new URL(req.url);
  const subjectId = searchParams.get("subjectId");

  const where = subjectId ? { subjectId } : {};

  const chapters = await prisma.chapter.findMany({
    where,
    include: {
      subject: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          questions: true,
        },
      },
    },
    orderBy: [{ subjectId: "asc" }, { order: "asc" }],
  });

  return NextResponse.json({ chapters });
});

/**
 * POST /api/admin/chapters
 * Create a new chapter
 */
export const POST = withAdminAuth(async (req: NextRequest, { user }) => {
  const data = await req.json();
  const { name, subjectId, description, order } = data;

  if (!name || !subjectId) {
    return NextResponse.json(
      { error: "Chapter name and subject are required" },
      { status: 400 }
    );
  }

  // Verify subject exists
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
  });

  if (!subject) {
    return NextResponse.json(
      { error: "Subject not found" },
      { status: 404 }
    );
  }

  // Check if chapter already exists for this subject
  const existing = await prisma.chapter.findUnique({
    where: {
      subjectId_name: {
        subjectId,
        name,
      },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Chapter with this name already exists for this subject" },
      { status: 409 }
    );
  }

  const chapter = await prisma.chapter.create({
    data: {
      name,
      subjectId,
      description,
      order: order || 0,
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
      action: "create",
      resourceType: "chapter",
      resourceId: chapter.id,
      description: `Created chapter: ${name} in ${subject.name}`,
      metadata: {
        chapterName: name,
        subjectName: subject.name,
      },
    },
  });

  return NextResponse.json({ chapter }, { status: 201 });
});
