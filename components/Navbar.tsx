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
    <nav className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-2 group">
              <BookOpen className="h-6 w-6 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">PrepWyse</span>
            </Link>

            <div className="hidden md:flex space-x-1">
              <Link
                href="/dashboard"
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition ${
                  isActive("/dashboard")
                    ? "bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>

              <Link
                href="/quiz"
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition ${
                  isActive("/quiz")
                    ? "bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Quizzes</span>
              </Link>

              <Link
                href="/mock-test"
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition ${
                  isActive("/mock-test")
                    ? "bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Trophy className="h-4 w-4" />
                <span>Mock Tests</span>
              </Link>

              <Link
                href="/results"
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition ${
                  isActive("/results")
                    ? "bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <BarChart className="h-4 w-4" />
                <span>Results</span>
              </Link>

              <Link
                href="/profile"
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition ${
                  isActive("/profile")
                    ? "bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition ${
                    isActive("/admin")
                      ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                      : "text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/30"
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
