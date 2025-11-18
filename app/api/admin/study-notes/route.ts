import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// Helper to check if user is admin
async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });
  const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];
  return user ? adminEmails.includes(user.email) : false;
}

// POST /api/admin/study-notes - Create study note (admin only)
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isAdmin(userId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await request.json();
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

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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
  } catch (error) {
    console.error("Error creating study note:", error);
    return NextResponse.json(
      { error: "Failed to create study note" },
      { status: 500 }
    );
  }
}

// GET /api/admin/study-notes - List all notes for admin
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isAdmin(userId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
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
  } catch (error) {
    console.error("Error fetching study notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch study notes" },
      { status: 500 }
    );
  }
}
