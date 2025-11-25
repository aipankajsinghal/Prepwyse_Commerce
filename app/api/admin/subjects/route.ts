/**
 * Admin API: Subjects Management
 * CRUD operations for subjects
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

/**
 * GET /api/admin/subjects
 * List all subjects for admin management
 */
export const GET = withAdminAuth(async (req: NextRequest, { user }) => {
  const subjects = await prisma.subject.findMany({
    include: {
      _count: {
        select: {
          chapters: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ subjects });
});

/**
 * POST /api/admin/subjects
 * Create a new subject
 */
export const POST = withAdminAuth(async (req: NextRequest, { user }) => {
  const data = await req.json();
  const { name, description, icon } = data;

  if (!name) {
    return NextResponse.json(
      { error: "Subject name is required" },
      { status: 400 }
    );
  }

  // Check if subject already exists
  const existing = await prisma.subject.findUnique({
    where: { name },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Subject with this name already exists" },
      { status: 409 }
    );
  }

  const subject = await prisma.subject.create({
    data: {
      name,
      description,
      icon,
    },
  });

  // Log admin activity
  await prisma.adminActivity.create({
    data: {
      adminId: user.clerkId,
      adminName: user.name || user.email,
      action: "create",
      resourceType: "subject",
      resourceId: subject.id,
      description: `Created subject: ${name}`,
      metadata: { subjectName: name },
    },
  });

  return NextResponse.json({ subject }, { status: 201 });
});
