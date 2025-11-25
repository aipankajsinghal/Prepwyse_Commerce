/**
 * Admin API: User Management
 * Manage users and admin roles
 * 
 * Refactored to use withAdminAuth pattern for cleaner code.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

/**
 * GET /api/admin/users
 * List all users with filtering and pagination
 */
export const GET = withAdminAuth(async (req: NextRequest, { user }) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const role = searchParams.get("role"); // "ADMIN" or "STUDENT"
  const search = searchParams.get("search"); // Search by name or email
  const skip = (page - 1) * limit;

  // Build filter conditions
  const where: any = {};
  
  if (role) {
    where.role = role;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        role: true,
        grade: true,
        points: true,
        level: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            quizAttempts: true,
            mockTests: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({
    users,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
});
