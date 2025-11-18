import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/prisma";

// DELETE /api/search/history/[id] - Delete a search history item
export async function DELETE(
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

    // Check if history item exists and belongs to user
    const historyItem = await prisma.searchHistory.findUnique({
      where: { id: params.id },
    });

    if (!historyItem) {
      return NextResponse.json(
        { error: "Search history item not found" },
        { status: 404 }
      );
    }

    if (historyItem.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete history item
    await prisma.searchHistory.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: "Search history item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting search history:", error);
    return NextResponse.json(
      { error: "Failed to delete search history" },
      { status: 500 }
    );
  }
}
