/**
 * Admin API: Study Notes Management
 * Phase D: Advanced Features
 * 
 * Refactored to use withAdminAuth pattern for cleaner code.
 * See REFACTORING_OPTIONS.md for details on this pattern.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

// POST /api/admin/study-notes - Create study note (admin only)
export const POST = withAdminAuth(async (req, { user }) => {
  const data = await req.json();
  const {
    chapterId,
    title,
    content,
    summary,
    type,
    difficulty,
    tags,
    pdfUrl,
    isPublished,
  } = data;

  // Validate required fields
  if (!chapterId || !title || !content) {
    return NextResponse.json(
      { error: "Chapter ID, title, and content are required" },
      { status: 400 }
    );
  }

  // Create study note
  const note = await prisma.studyNote.create({
    data: {
      chapterId,
      title,
      content,
      summary: summary || null,
      type: type || "official",
      authorId: user.id,
      difficulty: difficulty || "medium",
      tags: tags || null,
      pdfUrl: pdfUrl || null,
      isPublished: isPublished !== undefined ? isPublished : true,
    },
  });

  return NextResponse.json({ note }, { status: 201 });
});

// GET /api/admin/study-notes - List all notes for admin
export const GET = withAdminAuth(async (req, { user }) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const [notes, total] = await Promise.all([
    prisma.studyNote.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        chapterId: true,
        title: true,
        type: true,
        difficulty: true,
        views: true,
        likes: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { bookmarks: true },
        },
      },
    }),
    prisma.studyNote.count(),
  ]);

  return NextResponse.json({
    notes,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
});
