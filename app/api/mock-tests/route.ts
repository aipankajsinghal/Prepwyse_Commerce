import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, unauthorizedError } from "@/lib/api-error-handler";

// GET /api/mock-tests - Get all mock tests
export async function GET() {
  try {
    const mockTests = await prisma.mockTest.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(mockTests);
  } catch (error) {
    return handleApiError(error, "Failed to fetch mock tests");
  }
}

// POST /api/mock-tests - Create a new mock test (admin only)
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return unauthorizedError();
    }

    const { title, description, examType, totalQuestions, duration, sections } =
      await request.json();

    const mockTest = await prisma.mockTest.create({
      data: {
        title,
        description,
        examType,
        totalQuestions,
        duration,
        sections,
      },
    });

    return NextResponse.json(mockTest);
  } catch (error) {
    return handleApiError(error, "Failed to create mock test");
  }
}
