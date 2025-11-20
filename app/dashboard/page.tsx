import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import { DashboardClient } from "@/components/DashboardClient";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const userName = user?.firstName || user?.emailAddresses?.[0]?.emailAddress || "Student";

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] bg-pattern">
      <Navbar />
      <DashboardClient userName={userName} />
    </div>
  );
}
