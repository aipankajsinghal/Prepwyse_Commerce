import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/prisma";

// Helper to check if user is admin
async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });
  const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];
  return user ? adminEmails.includes(user.email) : false;
}

// PATCH /api/admin/practice-papers/[id] - Update practice paper (admin only)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isAdmin(userId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

    // Check if paper exists
    const existingPaper = await prisma.practicePaper.findUnique({
      where: { id: params.id },
    });

    if (!existingPaper) {
      return NextResponse.json(
        { error: "Practice paper not found" },
        { status: 404 }
      );
    }

    // Update practice paper
    const paper = await prisma.practicePaper.update({
      where: { id: params.id },
      data: {
        ...(year && { year: parseInt(year) }),
        ...(examType && { examType }),
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(duration && { duration: parseInt(duration) }),
        ...(totalMarks && { totalMarks: parseInt(totalMarks) }),
        ...(subjectId !== undefined && { subjectId }),
        ...(questions && { questions }),
        ...(solutions !== undefined && { solutions }),
        ...(difficulty && { difficulty }),
      },
    });

    return NextResponse.json({ paper });
  } catch (error) {
    console.error("Error updating practice paper:", error);
    return NextResponse.json(
      { error: "Failed to update practice paper" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/practice-papers/[id] - Delete practice paper (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isAdmin(userId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if paper exists
    const existingPaper = await prisma.practicePaper.findUnique({
      where: { id: params.id },
    });

    if (!existingPaper) {
      return NextResponse.json(
        { error: "Practice paper not found" },
        { status: 404 }
      );
    }

    // Delete practice paper (cascade will delete attempts)
    await prisma.practicePaper.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Practice paper deleted successfully" });
  } catch (error) {
    console.error("Error deleting practice paper:", error);
    return NextResponse.json(
      { error: "Failed to delete practice paper" },
      { status: 500 }
    );
  }
}
