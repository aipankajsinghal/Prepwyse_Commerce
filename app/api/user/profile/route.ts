import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

// PATCH /api/user/profile - Update user profile
export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { grade, bio } = await request.json();

    // Update user's public metadata using Clerk API
    const client = await clerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: {
        grade,
        bio,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Profile updated successfully" 
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
