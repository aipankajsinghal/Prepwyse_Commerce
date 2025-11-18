import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

type RouteParams = {
  params: Promise<{ id: string }>;
};

// GET /api/practice-papers/[id] - Get practice paper details
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const paper = await prisma.practicePaper.findUnique({
      where: { id },
      include: {
        _count: {
          select: { attempts: true },
        },
      },
    });

    if (!paper) {
      return NextResponse.json(
        { error: "Practice paper not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ paper });
  } catch (error) {
    console.error("Error fetching practice paper:", error);
    return NextResponse.json(
      { error: "Failed to fetch practice paper" },
      { status: 500 }
    );
  }
}
