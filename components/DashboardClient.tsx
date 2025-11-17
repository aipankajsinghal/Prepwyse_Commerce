"use client";

import Link from "next/link";
import { BookOpen, Target, Trophy, TrendingUp, Sparkles } from "lucide-react";
import { DashboardOnboarding } from "./DashboardOnboarding";
import { ProfileCompletionChecklist } from "./ProfileCompletionChecklist";

interface DashboardClientProps {
  userName: string;
}

export function DashboardClient({ userName }: DashboardClientProps) {
  return (
    <>
      <DashboardOnboarding />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {userName}!
          </h1>
          <p className="text-gray-600">
            Continue your learning journey and track your progress
          </p>
        </div>

        {/* Profile Completion Checklist */}
        <ProfileCompletionChecklist />

        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link 
            href="/quiz" 
            className="group"
            data-onboarding="create-quiz-btn"
          >
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

          <Link 
            href="/mock-test" 
            className="group"
            data-onboarding="mock-tests-btn"
          >
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition group-hover:border-primary-500 border-2 border-transparent">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Trophy className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Mock Tests</h3>
              <p className="text-gray-600">
                Full-length exams matching CUET pattern
              </p>
            </div>
          </Link>

          <Link href="/analytics" className="group">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition group-hover:border-primary-500 border-2 border-transparent">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Analytics</h3>
              <p className="text-gray-600">
                Track performance and identify improvements
              </p>
            </div>
          </Link>

          <Link href="/recommendations" className="group">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition group-hover:border-primary-500 border-2 border-transparent">
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Recommendations</h3>
              <p className="text-gray-600">
                Personalized study suggestions
              </p>
            </div>
          </Link>
        </div>

        {/* Subjects Section */}
        <div className="mb-8" data-onboarding="subjects-section">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Subjects</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Business Studies */}
            <Link href="/quiz" className="group">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-md hover:shadow-xl transition border-2 border-transparent group-hover:border-blue-400">
                <h3 className="text-xl font-semibold text-blue-900 mb-2">
                  Business Studies
                </h3>
                <p className="text-blue-700 text-sm mb-4">23 Chapters Available</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-600">Start Learning →</span>
                </div>
              </div>
            </Link>

            {/* Accountancy */}
            <Link href="/quiz" className="group">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-md hover:shadow-xl transition border-2 border-transparent group-hover:border-green-400">
                <h3 className="text-xl font-semibold text-green-900 mb-2">
                  Accountancy
                </h3>
                <p className="text-green-700 text-sm mb-4">20 Chapters Available</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-600">Start Learning →</span>
                </div>
              </div>
            </Link>

            {/* Economics */}
            <Link href="/quiz" className="group">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-md hover:shadow-xl transition border-2 border-transparent group-hover:border-purple-400">
                <h3 className="text-xl font-semibold text-purple-900 mb-2">
                  Economics
                </h3>
                <p className="text-purple-700 text-sm mb-4">18 Chapters Available</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-600">Start Learning →</span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Progress Section */}
        <div className="bg-white rounded-xl shadow-md p-6" data-onboarding="progress-section">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Progress</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <p className="text-3xl font-bold text-blue-900 mb-1">0</p>
              <p className="text-sm text-blue-700">Quizzes Completed</p>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <Trophy className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <p className="text-3xl font-bold text-green-900 mb-1">0</p>
              <p className="text-sm text-green-700">Mock Tests Taken</p>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <Target className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <p className="text-3xl font-bold text-purple-900 mb-1">0%</p>
              <p className="text-sm text-purple-700">Average Score</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
