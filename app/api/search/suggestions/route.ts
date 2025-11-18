import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/prisma";

// GET /api/search/suggestions - Get search suggestions for auto-complete
export async function GET(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "5");

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const searchTerm = query.trim().toLowerCase();

    // Get suggestions from different sources
    const [chapters, subjects, recentSearches] = await Promise.all([
      // Chapter suggestions
      prisma.chapter.findMany({
        where: {
          name: { contains: searchTerm, mode: "insensitive" },
        },
        take: limit,
        select: {
          name: true,
          subject: { select: { name: true } },
        },
      }),

      // Subject suggestions
      prisma.subject.findMany({
        where: {
          name: { contains: searchTerm, mode: "insensitive" },
        },
        take: limit,
        select: { name: true },
      }),

      // Recent searches (if user is authenticated)
      prisma.user
        .findUnique({
          where: { clerkId: userId },
        })
        .then(async (user) => {
          if (!user) return [];
          return prisma.searchHistory.findMany({
            where: {
              userId: user.id,
              query: { contains: searchTerm, mode: "insensitive" },
            },
            take: limit,
            orderBy: { createdAt: "desc" },
            distinct: ["query"],
            select: { query: true },
          });
        }),
    ]);

    // Combine and format suggestions
    const suggestions = [
      ...chapters.map((ch) => ({
        text: ch.name,
        type: "chapter",
        subtitle: ch.subject.name,
      })),
      ...subjects.map((s) => ({
        text: s.name,
        type: "subject",
        subtitle: "Subject",
      })),
      ...recentSearches.map((s) => ({
        text: s.query,
        type: "recent",
        subtitle: "Recent search",
      })),
    ];

    // Remove duplicates and limit
    const uniqueSuggestions = suggestions
      .filter(
        (suggestion, index, self) =>
          index === self.findIndex((s) => s.text === suggestion.text)
      )
      .slice(0, limit);

    return NextResponse.json({ suggestions: uniqueSuggestions });
  } catch (error) {
    console.error("Error getting search suggestions:", error);
    return NextResponse.json(
      { error: "Failed to get suggestions" },
      { status: 500 }
    );
  }
}
