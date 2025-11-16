import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { BookOpen, Target, Trophy, TrendingUp, Sparkles } from "lucide-react";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName || user?.emailAddresses[0].emailAddress || "Student"}!
          </h1>
          <p className="text-gray-600">
            Continue your learning journey and track your progress
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/quiz" className="group">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition group-hover:border-primary-500 border-2 border-transparent">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Practice Quiz</h3>
              <p className="text-gray-600">
                AI-generated quizzes with adaptive difficulty
              </p>
            </div>
          </Link>

          <Link href="/mock-test" className="group">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition group-hover:border-primary-500 border-2 border-transparent">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Trophy className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Mock Tests</h3>
              <p className="text-gray-600">
                Take full-length mock tests as per exam pattern
              </p>
            </div>
          </Link>

          <Link href="/recommendations" className="group">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl shadow-md hover:shadow-xl transition group-hover:border-purple-500 border-2 border-purple-200">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 flex items-center">
                AI Recommendations
                <span className="ml-2 text-xs bg-purple-600 text-white px-2 py-1 rounded">NEW</span>
              </h3>
              <p className="text-gray-600">
                Get personalized study suggestions powered by AI
              </p>
            </div>
          </Link>

          <Link href="/results" className="group">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition group-hover:border-primary-500 border-2 border-transparent">
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">View Results</h3>
              <p className="text-gray-600">
                Check your scores and track improvement over time
              </p>
            </div>
          </Link>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-gray-600 font-medium">Quizzes Taken</h4>
              <Target className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">0</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-gray-600 font-medium">Mock Tests</h4>
              <Trophy className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">0</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-gray-600 font-medium">Average Score</h4>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">-</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-gray-600 font-medium">Study Streak</h4>
              <BookOpen className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">0 days</p>
          </div>
        </div>

        {/* Subjects Overview */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Available Subjects</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 transition">
              <h3 className="font-semibold text-lg mb-2">Business Studies</h3>
              <p className="text-gray-600 text-sm">Core commerce subject</p>
            </div>
            <div className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 transition">
              <h3 className="font-semibold text-lg mb-2">Accountancy</h3>
              <p className="text-gray-600 text-sm">Financial accounting & analysis</p>
            </div>
            <div className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 transition">
              <h3 className="font-semibold text-lg mb-2">Economics</h3>
              <p className="text-gray-600 text-sm">Micro & Macro economics</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
