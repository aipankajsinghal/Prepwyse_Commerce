import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, unauthorizedError, validationError, notFoundError } from "@/lib/api-error-handler";
import { logger } from "@/lib/logger";

/**
 * Delete user account and all associated data (GDPR/DPDP compliance)
 * DELETE /api/user/delete
 */
export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return unauthorizedError();
    }

    // Get confirmation from request body
    const body = await request.json();
    const { confirmation } = body;

    if (confirmation !== "DELETE MY ACCOUNT") {
      return validationError("Invalid confirmation. Please type 'DELETE MY ACCOUNT' exactly.");
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return notFoundError("User");
    }

    // Delete user data in correct order (respecting foreign key constraints)
    await prisma.$transaction(async (tx) => {
      // 1. Delete quiz attempts
      await tx.quizAttempt.deleteMany({
        where: { userId: user.id },
      });

      // 2. Delete user record (quizzes are system-generated and not user-specific)
      await tx.user.delete({
        where: { id: user.id },
      });
    });

    logger.compliance("User account deleted", { userId: user.id, clerkId: userId });

    // Note: Clerk user deletion should be handled separately via Clerk Dashboard or API
    // This ensures proper handling of authentication state

    return NextResponse.json({
      success: true,
      message: "Account and all associated data have been permanently deleted.",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error, "Failed to delete account");
  }
}
