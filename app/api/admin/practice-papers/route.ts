import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminAuth } from "@/lib/auth/requireAdmin";

// POST /api/admin/practice-papers - Create practice paper (admin only)
export async function POST(request: Request) {
  try {
    // Check admin authorization
    const authResult = await checkAdminAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const data = await request.json();
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
  } catch (error) {
    console.error("Error creating practice paper:", error);
    return NextResponse.json(
      { error: "Failed to create practice paper" },
      { status: 500 }
    );
  }
}

// GET /api/admin/practice-papers - List all papers for admin
export async function GET(request: Request) {
  try {
    // Check admin authorization
    const authResult = await checkAdminAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { searchParams } = new URL(request.url);
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
  } catch (error) {
    console.error("Error fetching practice papers:", error);
    return NextResponse.json(
      { error: "Failed to fetch practice papers" },
      { status: 500 }
    );
  }
}
