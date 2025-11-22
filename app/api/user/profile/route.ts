import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

// PATCH /api/user/profile - Update user profile
export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { grade, bio, profilePromptDismissed } = await request.json();

    // Update user's public metadata using Clerk API
    const client = await clerkClient();
    
    // Get current metadata to preserve existing values
    const currentUser = await client.users.getUser(userId);
    const currentMetadata = currentUser.publicMetadata || {};
    
    // Merge new data with existing metadata
    const updatedMetadata: any = { ...currentMetadata };
    if (grade !== undefined) updatedMetadata.grade = grade;
    if (bio !== undefined) updatedMetadata.bio = bio;
    if (profilePromptDismissed !== undefined) updatedMetadata.profilePromptDismissed = profilePromptDismissed;
    
    await client.users.updateUser(userId, {
      publicMetadata: updatedMetadata,
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
