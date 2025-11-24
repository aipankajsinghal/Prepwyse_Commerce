import { NextResponse } from "next/server";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/user/profile - Update user profile
export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { firstName, lastName, grade, bio, profilePromptDismissed, preferredLanguage, favoriteSubjects } = await request.json();

    // Update user's public metadata using Clerk API
    const client = await clerkClient();
    
    // Get current metadata to preserve existing values
    const user = await currentUser();
    const currentMetadata = user?.publicMetadata || {};
    
    // Prepare update data for Clerk
    const updateData: any = {};
    
    // Update basic profile fields (firstName, lastName)
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    
    // Merge metadata
    const updatedMetadata: any = { ...currentMetadata };
    if (grade !== undefined) updatedMetadata.grade = grade;
    if (bio !== undefined) updatedMetadata.bio = bio;
    if (profilePromptDismissed !== undefined) updatedMetadata.profilePromptDismissed = profilePromptDismissed;
    
    updateData.publicMetadata = updatedMetadata;
    
    // Update Clerk user
    await client.users.updateUser(userId, updateData);

    // Sync with Prisma database
    const email = user?.emailAddresses?.[0]?.emailAddress;
    if (!email) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }

    // Prepare data for Prisma update
    const prismaUpdateData: any = {
      email,
      name: `${firstName || user?.firstName || ""} ${lastName || user?.lastName || ""}`.trim() || null,
    };

    if (grade !== undefined) prismaUpdateData.grade = grade;
    if (preferredLanguage !== undefined) prismaUpdateData.preferredLanguage = preferredLanguage;
    if (favoriteSubjects !== undefined) prismaUpdateData.favoriteSubjects = favoriteSubjects;

    // Upsert user in Prisma database
    await prisma.user.upsert({
      where: { clerkId: userId },
      update: prismaUpdateData,
      create: {
        clerkId: userId,
        ...prismaUpdateData,
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
