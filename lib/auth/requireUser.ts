import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function requireUser(req: Request) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
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
    },
  });

  return dbUser;
}
