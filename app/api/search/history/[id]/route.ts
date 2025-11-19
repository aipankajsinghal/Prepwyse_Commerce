import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, unauthorizedError, notFoundError, forbiddenError } from "@/lib/api-error-handler";


type RouteParams = {
  params: Promise<{ id: string }>;
};

// DELETE /api/search/history/[id] - Delete a search history item
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { userId } = await auth();
    if (!userId) return unauthorizedError();

    const { id } = await params;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) return notFoundError("User not found");

    // Check if history item exists and belongs to user
    const historyItem = await prisma.searchHistory.findUnique({
      where: { id },
    });

    if (!historyItem) return notFoundError("Search history item not found");

    if (historyItem.userId !== user.id) return forbiddenError();

    // Delete history item
    await prisma.searchHistory.delete({
      where: { id: id },
    });

    return NextResponse.json({
      message: "Search history item deleted successfully",
    });
  } catch (error) {
    return handleApiError(error, "Failed to delete search history");
  }
}
