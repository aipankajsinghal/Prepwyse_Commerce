import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";


type RouteParams = {
  params: Promise<{ id: string }>;
};

// POST /api/study-notes/[id]/like - Like/unlike a study note
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if note exists
    const note = await prisma.studyNote.findUnique({
      where: { id },
    });

    if (!note) {
      return NextResponse.json(
        { error: "Study note not found" },
        { status: 404 }
      );
    }

    // For simplicity, we'll just increment the likes count
    // In a production app, you might want to track who liked what
    const updatedNote = await prisma.studyNote.update({
      where: { id: id },
      data: { likes: { increment: 1 } },
    });

    return NextResponse.json({ note: updatedNote });
  } catch (error) {
    console.error("Error liking study note:", error);
    return NextResponse.json(
      { error: "Failed to like study note" },
      { status: 500 }
    );
  }
}
