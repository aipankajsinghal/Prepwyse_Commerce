"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { BookOpen, Home, FileText, Trophy, BarChart } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white shadow-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">PrepWyse</span>
            </Link>

            <div className="hidden md:flex space-x-1">
              <Link
                href="/dashboard"
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  isActive("/dashboard")
                    ? "bg-primary-100 text-primary-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>

              <Link
                href="/quiz"
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  isActive("/quiz")
                    ? "bg-primary-100 text-primary-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Quizzes</span>
              </Link>

              <Link
                href="/mock-test"
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  isActive("/mock-test")
                    ? "bg-primary-100 text-primary-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Trophy className="h-4 w-4" />
                <span>Mock Tests</span>
              </Link>

              <Link
                href="/results"
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  isActive("/results")
                    ? "bg-primary-100 text-primary-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <BarChart className="h-4 w-4" />
                <span>Results</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    </nav>
  );
}
