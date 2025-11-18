import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET /api/practice-papers/attempts - Get user's practice paper attempts
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const paperId = searchParams.get("paperId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Build where clause
    const where: any = { userId: user.id };
    if (paperId) {
      where.paperId = paperId;
    }

    // Get attempts with pagination
    const [attempts, total] = await Promise.all([
      prisma.practicePaperAttempt.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startedAt: "desc" },
        include: {
          paper: {
            select: {
              id: true,
              title: true,
              examType: true,
              year: true,
              totalMarks: true,
              difficulty: true,
            },
          },
        },
      }),
      prisma.practicePaperAttempt.count({ where }),
    ]);

    return NextResponse.json({
      attempts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching practice paper attempts:", error);
    return NextResponse.json(
      { error: "Failed to fetch attempts" },
      { status: 500 }
    );
  }
}
