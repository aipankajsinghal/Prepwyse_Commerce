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
  // Optimized: Read-first strategy to reduce DB writes. 
  // TODO: Implement Clerk Webhooks for real-time profile updates.
  let dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        email,
        name: `${clerkUser?.firstName || ""} ${clerkUser?.lastName || ""}`.trim() || null,
      },
    });
  }

  return dbUser;
}
