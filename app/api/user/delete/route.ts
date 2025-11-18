import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * Delete user account and all associated data (GDPR/DPDP compliance)
 * DELETE /api/user/delete
 */
export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get confirmation from request body
    const body = await request.json();
    const { confirmation } = body;

    if (confirmation !== "DELETE MY ACCOUNT") {
      return NextResponse.json(
        { error: "Invalid confirmation. Please type 'DELETE MY ACCOUNT' exactly." },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete user data in correct order (respecting foreign key constraints)
    await prisma.$transaction(async (tx) => {
      // 1. Delete quiz attempts
      await tx.quizAttempt.deleteMany({
        where: { userId: user.id },
      });

      // 2. Delete quizzes created by user
      await tx.quiz.deleteMany({
        where: { createdBy: user.id },
      });

      // 3. Delete user record
      await tx.user.delete({
        where: { id: user.id },
      });
    });

    console.log(`[GDPR] User account deleted: ${user.id} (${userId})`);

    // Note: Clerk user deletion should be handled separately via Clerk Dashboard or API
    // This ensures proper handling of authentication state

    return NextResponse.json({
      success: true,
      message: "Account and all associated data have been permanently deleted.",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Account deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete account", details: error.message },
      { status: 500 }
    );
  }
}
