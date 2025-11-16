import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// POST /api/user/sync - Sync Clerk user with database
export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();

    const dbUser = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {
        email: user?.emailAddresses[0].emailAddress || "",
        name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || null,
      },
      create: {
        clerkId: userId,
        email: user?.emailAddresses[0].emailAddress || "",
        name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || null,
      },
    });

    return NextResponse.json(dbUser);
  } catch (error) {
    console.error("Error syncing user:", error);
    return NextResponse.json(
      { error: "Failed to sync user" },
      { status: 500 }
    );
  }
}
