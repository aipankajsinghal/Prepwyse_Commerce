import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { generateContentRecommendations } from "@/lib/ai-services";

// GET /api/ai/content-suggestions - Get smart content recommendations
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId") || undefined;

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate content recommendations
    const recommendations = await generateContentRecommendations({
      userId: dbUser.id,
      subjectId,
    });

    return NextResponse.json(recommendations);
  } catch (error: any) {
    console.error("Error generating content suggestions:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate content suggestions" },
      { status: 500 }
    );
  }
}
