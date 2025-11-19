import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, unauthorizedError, notFoundError, validationError } from "@/lib/api-error-handler";

// GET /api/search/history - Get user's search history
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return unauthorizedError();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) return notFoundError("User not found");

    // Get search history
    const history = await prisma.searchHistory.findMany({
      where: { userId: user.id },
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        query: true,
        resultCount: true,
        filters: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ history });
  } catch (error) {
    return handleApiError(error, "Failed to fetch search history");
  }
}

// POST /api/search/history - Save search to history (manual save)
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return unauthorizedError();

    const { query, resultCount, filters } = await request.json();

    if (!query) return validationError("Query is required");

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) return notFoundError("User not found");

    // Save search history
    const history = await prisma.searchHistory.create({
      data: {
        userId: user.id,
        query: query.trim(),
        resultCount: resultCount || 0,
        filters: filters || null,
      },
    });

    return NextResponse.json({ history }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "Failed to save search history");
  }
}
