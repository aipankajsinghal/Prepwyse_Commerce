/**
 * Admin API: Practice Papers Management
 * Phase D: Advanced Features
 * 
 * Refactored to use withAdminAuth pattern for cleaner code.
 * See REFACTORING_OPTIONS.md for details on this pattern.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

// POST /api/admin/practice-papers - Create practice paper (admin only)
export const POST = withAdminAuth(async (req, { user }) => {
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

  // Validate required fields
  if (
    !year ||
    !examType ||
    !title ||
    !duration ||
    !totalMarks ||
    !questions
  ) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Create practice paper
  const paper = await prisma.practicePaper.create({
    data: {
      year: parseInt(year),
      examType,
      title,
      description: description || null,
      duration: parseInt(duration),
      totalMarks: parseInt(totalMarks),
      subjectId: subjectId || null,
      questions,
      solutions: solutions || null,
      difficulty: difficulty || "medium",
    },
  });

  return NextResponse.json({ paper }, { status: 201 });
});

// GET /api/admin/practice-papers - List all papers for admin
export const GET = withAdminAuth(async (req, { user }) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const [papers, total] = await Promise.all([
    prisma.practicePaper.findMany({
      skip,
      take: limit,
      orderBy: [{ year: "desc" }, { createdAt: "desc" }],
      include: {
        _count: {
          select: { attempts: true },
        },
      },
    }),
    prisma.practicePaper.count(),
  ]);

  return NextResponse.json({
    papers,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
});
