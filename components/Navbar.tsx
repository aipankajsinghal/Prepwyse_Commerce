"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { BookOpen, Home, FileText, Trophy, BarChart, User, Shield } from "lucide-react";
import { usePathname } from "next/navigation";
import ThemeSelector from "./ThemeSelector";
import { useUser } from "@clerk/nextjs";

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useUser();

  const isActive = (path: string) => pathname === path;
  const isAdmin = user?.publicMetadata?.role === "admin" || user?.primaryEmailAddress?.emailAddress?.includes("admin");

  return (
    <nav className="bg-surface-elevated shadow-md border-b border-text-primary/10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-2 group">
              <BookOpen className="h-6 w-6 text-accent-1 group-hover:scale-110 transition-transform" />
              <span className="text-xl font-display font-bold text-primary">PrepWyse</span>
            </Link>

            <div className="hidden md:flex space-x-1">
              <Link
                href="/dashboard"
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 font-display transition ${
                  isActive("/dashboard")
                    ? "bg-accent-1/10 text-accent-1"
                    : "text-text-secondary hover:bg-accent-1/5 hover:text-accent-1"
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>

              <Link
                href="/quiz"
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 font-display transition ${
                  isActive("/quiz")
                    ? "bg-accent-1/10 text-accent-1"
                    : "text-text-secondary hover:bg-accent-1/5 hover:text-accent-1"
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Quizzes</span>
              </Link>

              <Link
                href="/mock-test"
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 font-display transition ${
                  isActive("/mock-test")
                    ? "bg-accent-1/10 text-accent-1"
                    : "text-text-secondary hover:bg-accent-1/5 hover:text-accent-1"
                }`}
              >
                <Trophy className="h-4 w-4" />
                <span>Mock Tests</span>
              </Link>

              <Link
                href="/analytics"
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 font-display transition ${
                  isActive("/analytics")
                    ? "bg-accent-1/10 text-accent-1"
                    : "text-text-secondary hover:bg-accent-1/5 hover:text-accent-1"
                }`}
              >
                <BarChart className="h-4 w-4" />
                <span>Analytics</span>
              </Link>

              <Link
                href="/profile"
                data-onboarding="profile-link"
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 font-display transition ${
                  isActive("/profile")
                    ? "bg-accent-1/10 text-accent-1"
                    : "text-text-secondary hover:bg-accent-1/5 hover:text-accent-1"
                }`}
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 font-display transition ${
                    isActive("/admin")
                      ? "bg-semantic-error/10 text-semantic-error"
                      : "text-text-secondary hover:bg-semantic-error/5 hover:text-semantic-error"
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  <span>Admin</span>
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeSelector />
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9",
                },
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
