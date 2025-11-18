import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET /api/practice-papers - List all practice papers
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const examType = searchParams.get("examType");
    const year = searchParams.get("year");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (examType) {
      where.examType = examType;
    }
    if (year) {
      where.year = parseInt(year);
    }

    // Get papers with pagination
    const [papers, total] = await Promise.all([
      prisma.practicePaper.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ year: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          year: true,
          examType: true,
          title: true,
          description: true,
          duration: true,
          totalMarks: true,
          difficulty: true,
          createdAt: true,
          _count: {
            select: { attempts: true },
          },
        },
      }),
      prisma.practicePaper.count({ where }),
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
