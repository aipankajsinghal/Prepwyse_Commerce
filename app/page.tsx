import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { BookOpen, Target, Trophy, Users } from "lucide-react";

export default async function Home() {
  const { userId } = await auth();
  
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">PrepWyse Commerce</span>
          </div>
          <div className="space-x-4">
            <Link
              href="/sign-in"
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Master Commerce with
          <span className="text-primary-600"> AI-Powered Learning</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Comprehensive preparation platform for Class 11, Class 12, and CUET Commerce exams.
          Practice with adaptive quizzes and full-length mock tests.
        </p>
        <Link
          href="/sign-up"
          className="inline-block px-8 py-4 bg-primary-600 text-white text-lg rounded-lg hover:bg-primary-700 font-semibold transition"
        >
          Start Learning Now
        </Link>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Chapter-wise Practice</h3>
            <p className="text-gray-600">
              Select multiple chapters and practice targeted quizzes for better understanding.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <Target className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Mock Tests</h3>
            <p className="text-gray-600">
              Full-length mock tests following actual exam patterns for Class 11, 12, and CUET.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <Trophy className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Performance Analytics</h3>
            <p className="text-gray-600">
              Track your progress with detailed analytics and identify areas for improvement.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Multi-Platform</h3>
            <p className="text-gray-600">
              Access from anywhere - mobile, tablet, or desktop. Learn on the go!
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2024 PrepWyse Commerce. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
