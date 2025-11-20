import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * Verifies that the current user is authenticated and has admin role.
 * Returns the admin user if authorized, or throws an error.
 * 
 * @returns Promise<User> The admin user object from database
 * @throws Error if user is not authenticated or not an admin
 */
export async function requireAdmin() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized: No user session found");
  }

  const clerkUser = await currentUser();
  
  // Validate email exists
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
  if (!email) {
    throw new Error("User email address is required");
  }
  
  // Ensure user exists in database
  const dbUser = await prisma.user.upsert({
    where: { clerkId: userId },
    update: {
      email,
      name: `${clerkUser?.firstName || ""} ${clerkUser?.lastName || ""}`.trim() || null,
    },
    create: {
      clerkId: userId,
      email,
      name: `${clerkUser?.firstName || ""} ${clerkUser?.lastName || ""}`.trim() || null,
      role: "STUDENT", // Default role for new users
    },
  });

  // Check if user has admin role
  if (dbUser.role !== "ADMIN") {
    throw new Error("Forbidden: Admin access required");
  }

  return dbUser;
}

/**
 * Middleware helper for API routes to check admin authorization.
 * Returns a NextResponse with appropriate error status if not authorized.
 * 
 * @returns Promise<{ user: User } | NextResponse> Either the admin user or an error response
 */
export async function checkAdminAuth(): Promise<{ user: any } | NextResponse> {
  try {
    const user = await requireAdmin();
    return { user };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Authorization failed";
    
    if (message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }
    
    if (message.includes("Forbidden")) {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: "Authorization failed" },
      { status: 500 }
    );
  }
}
