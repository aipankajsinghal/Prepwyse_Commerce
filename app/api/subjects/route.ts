import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-error-handler";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

// GET /api/subjects - Get all subjects with chapters
export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        chapters: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    return NextResponse.json(subjects);
  } catch (error) {
    return handleApiError(error, "Failed to fetch subjects");
  }
}

// POST /api/subjects - Create a new subject (admin only)
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const { name, description, icon } = await request.json();

    const subject = await prisma.subject.create({
      data: {
        name,
        description,
        icon,
      },
    });

    return NextResponse.json(subject);
  } catch (error) {
    return handleApiError(error, "Failed to create subject");
  }
});
