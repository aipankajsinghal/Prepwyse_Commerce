/**
 * Admin API: Individual User Management
 * Update user details and manage admin roles
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuthParams } from "@/lib/auth/withAdminAuth";

/**
 * GET /api/admin/users/[userId]
 * Get detailed user information
 */
export const GET = withAdminAuthParams(async (req: NextRequest, { user, params }) => {
  const { userId } = params;

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: {
        include: {
          plan: true,
        },
      },
      _count: {
        select: {
          quizAttempts: true,
          mockTests: true,
          referrals: true,
        },
      },
    },
  });

  if (!targetUser) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ user: targetUser });
});

/**
 * PATCH /api/admin/users/[userId]
 * Update user details (including role)
 */
export const PATCH = withAdminAuthParams(async (req: NextRequest, { user, params }) => {
  const { userId } = params;
  const data = await req.json();

  // Check if user exists
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!targetUser) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }

  // Validate role change if provided
  if (data.role && !["STUDENT", "ADMIN"].includes(data.role)) {
    return NextResponse.json(
      { error: "Invalid role. Must be STUDENT or ADMIN" },
      { status: 400 }
    );
  }

  // Prevent self-demotion from admin
  if (targetUser.id === user.id && data.role === "STUDENT") {
    return NextResponse.json(
      { error: "Cannot demote yourself from admin" },
      { status: 403 }
    );
  }

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      role: data.role,
      grade: data.grade,
      name: data.name,
    },
  });

  // Log admin activity for role changes
  if (data.role && data.role !== targetUser.role) {
    await prisma.adminActivity.create({
      data: {
        adminId: user.clerkId,
        adminName: user.name || user.email,
        action: "update",
        resourceType: "user",
        resourceId: userId,
        description: `Changed user role from ${targetUser.role} to ${data.role}`,
        metadata: {
          previousRole: targetUser.role,
          newRole: data.role,
          targetUserEmail: targetUser.email,
        },
      },
    });
  }

  return NextResponse.json({ user: updatedUser });
});

/**
 * DELETE /api/admin/users/[userId]
 * Delete a user (soft delete or hard delete)
 */
export const DELETE = withAdminAuthParams(async (req: NextRequest, { user, params }) => {
  const { userId } = params;

  // Check if user exists
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!targetUser) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }

  // Prevent self-deletion
  if (targetUser.id === user.id) {
    return NextResponse.json(
      { error: "Cannot delete your own account" },
      { status: 403 }
    );
  }

  // Delete user (cascade will handle related records)
  await prisma.user.delete({
    where: { id: userId },
  });

  // Log admin activity
  await prisma.adminActivity.create({
    data: {
      adminId: user.clerkId,
      adminName: user.name || user.email,
      action: "delete",
      resourceType: "user",
      resourceId: userId,
      description: `Deleted user ${targetUser.email}`,
      metadata: {
        userEmail: targetUser.email,
        userRole: targetUser.role,
      },
    },
  });

  return NextResponse.json({ success: true, message: "User deleted successfully" });
});
