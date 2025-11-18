import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/prisma";

// POST /api/study-notes/[id]/like - Like/unlike a study note
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if note exists
    const note = await prisma.studyNote.findUnique({
      where: { id: params.id },
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
      where: { id: params.id },
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
