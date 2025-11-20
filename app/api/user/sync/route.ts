import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, unauthorizedError, validationError } from "@/lib/api-error-handler";

// POST /api/user/sync - Sync Clerk user with database
export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) return unauthorizedError();

    const user = await currentUser();
    
    // Validate email exists
    const email = user?.emailAddresses?.[0]?.emailAddress;
    if (!email) {
      return validationError("User email address is required");
    }

    const dbUser = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {
        email,
        name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || null,
      },
      create: {
        clerkId: userId,
        email,
        name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || null,
      },
    });

    return NextResponse.json(dbUser);
  } catch (error) {
    return handleApiError(error, "Failed to sync user");
  }
}
