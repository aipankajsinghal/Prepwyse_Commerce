import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/subjects - Get all subjects with chapters
export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        chapters: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    return NextResponse.json(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}

// POST /api/subjects - Create a new subject (admin only in production)
export async function POST(request: Request) {
  try {
    const { name, description, icon } = await request.json();

    const subject = await prisma.subject.create({
      data: {
        name,
        description,
        icon,
      },
    });

    return NextResponse.json(subject);
  } catch (error) {
    console.error("Error creating subject:", error);
    return NextResponse.json(
      { error: "Failed to create subject" },
      { status: 500 }
    );
  }
}
