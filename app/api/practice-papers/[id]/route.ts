import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, unauthorizedError, notFoundError } from "@/lib/api-error-handler";

type RouteParams = {
  params: Promise<{ id: string }>;
};

// GET /api/practice-papers/[id] - Get practice paper details
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { userId } = await auth();
    if (!userId) return unauthorizedError();

    const { id } = await params;
    const paper = await prisma.practicePaper.findUnique({
      where: { id },
      include: {
        _count: {
          select: { attempts: true },
        },
      },
    });

    if (!paper) return notFoundError("Practice paper not found");

    return NextResponse.json({ paper });
  } catch (error) {
    return handleApiError(error, "Failed to fetch practice paper");
  }
}
