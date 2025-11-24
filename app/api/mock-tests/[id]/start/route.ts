import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, unauthorizedError, notFoundError } from "@/lib/api-error-handler";

// POST /api/mock-tests/[id]/start - Start a mock test attempt
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return unauthorizedError();
    }

    const user = await currentUser();
    const params = await context.params;
    const mockTestId = params.id;

    // Ensure user exists in database
    const dbUser = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {
        email: user?.emailAddresses?.[0]?.emailAddress || "",
        name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || null,
      },
      create: {
        clerkId: userId,
        email: user?.emailAddresses?.[0]?.emailAddress || "",
        name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || null,
      },
    });

    // Get mock test details
    const mockTest = await prisma.mockTest.findUnique({
      where: { id: mockTestId },
    });

    if (!mockTest) {
      return notFoundError("Mock test");
    }

    // Create mock test attempt
    const attempt = await prisma.mockTestAttempt.create({
      data: {
        userId: dbUser.id,
        mockTestId: mockTest.id,
        totalQuestions: mockTest.totalQuestions,
        answers: [],
        sectionScores: {},
      },
    });

    return NextResponse.json({
      attemptId: attempt.id,
      mockTest,
      message: "Mock test started successfully",
    });
  } catch (error) {
    return handleApiError(error, "Failed to start mock test");
  }
}
