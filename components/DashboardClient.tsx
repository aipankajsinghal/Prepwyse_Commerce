"use client";

import Link from "next/link";
import { BookOpen, Target, Trophy, TrendingUp, Sparkles } from "lucide-react";
import { DashboardOnboarding } from "./DashboardOnboarding";
import { ProfileCompletionChecklist } from "./ProfileCompletionChecklist";
import { FirstLoginProfilePrompt } from "./FirstLoginProfilePrompt";

interface DashboardClientProps {
  userName: string;
}

export function DashboardClient({ userName }: DashboardClientProps) {
  return (
    <>
      <FirstLoginProfilePrompt />
      <DashboardOnboarding />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-reveal">
          <h1 className="text-3xl font-display font-bold text-primary mb-2">
            Welcome back, {userName}!
          </h1>
          <p className="font-body text-text-secondary">
            Continue your learning journey and track your progress
          </p>
        </div>

        {/* Profile Completion Checklist */}
        <ProfileCompletionChecklist />

        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link 
            href="/quiz" 
            className="group animate-reveal delay-100"
            data-onboarding="create-quiz-btn"
          >
            <div className="edu-card group-hover:border-accent-1 border-2 border-transparent">
              <div className="h-12 w-12 bg-accent-1/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent-1 transition-colors">
                <BookOpen className="h-6 w-6 text-accent-1 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-2 text-text-primary break-words">Practice Quiz</h3>
              <p className="font-body text-text-secondary break-words">
                AI-generated quizzes with adaptive difficulty
              </p>
            </div>
          </Link>

          <Link 
            href="/mock-test" 
            className="group animate-reveal delay-200"
            data-onboarding="mock-tests-btn"
          >
            <div className="edu-card group-hover:border-accent-2 border-2 border-transparent">
              <div className="h-12 w-12 bg-accent-2/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent-2 transition-colors">
                <Trophy className="h-6 w-6 text-accent-2 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-2 text-text-primary break-words">Mock Tests</h3>
              <p className="font-body text-text-secondary break-words">
                Full-length exams matching CUET pattern
              </p>
            </div>
          </Link>

          <Link href="/analytics" className="group animate-reveal delay-300">
            <div className="edu-card group-hover:border-accent-1 border-2 border-transparent">
              <div className="h-12 w-12 bg-accent-1/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent-1 transition-colors">
                <TrendingUp className="h-6 w-6 text-accent-1 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-2 text-text-primary break-words">Analytics</h3>
              <p className="font-body text-text-secondary break-words">
                Track performance and identify improvements
              </p>
            </div>
          </Link>

          <Link href="/recommendations" className="group animate-reveal delay-400">
            <div className="edu-card group-hover:border-accent-2 border-2 border-transparent">
              <div className="h-12 w-12 bg-accent-2/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent-2 transition-colors">
                <Sparkles className="h-6 w-6 text-accent-2 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-2 text-text-primary break-words">AI Recommendations</h3>
              <p className="font-body text-text-secondary break-words">
                Personalized study suggestions
              </p>
            </div>
          </Link>
        </div>

        {/* Subjects Section */}
        <div className="mb-8" data-onboarding="subjects-section">
          <h2 className="text-2xl font-display font-bold text-primary mb-6">Your Subjects</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Business Studies */}
            <Link href="/quiz" className="group">
              <div className="edu-card bg-gradient-to-br from-accent-1/5 to-accent-1/10 border-2 border-transparent group-hover:border-accent-1">
                <h3 className="text-xl font-display font-semibold text-primary mb-2 break-words">
                  Business Studies
                </h3>
                <p className="font-body text-text-secondary text-sm mb-4 break-words">23 Chapters Available</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-display font-semibold text-accent-1">Start Learning →</span>
                </div>
              </div>
            </Link>

            {/* Accountancy */}
            <Link href="/quiz" className="group">
              <div className="edu-card bg-gradient-to-br from-accent-2/5 to-accent-2/10 border-2 border-transparent group-hover:border-accent-2">
                <h3 className="text-xl font-display font-semibold text-primary mb-2 break-words">
                  Accountancy
                </h3>
                <p className="font-body text-text-secondary text-sm mb-4 break-words">20 Chapters Available</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-display font-semibold text-accent-2">Start Learning →</span>
                </div>
              </div>
            </Link>

            {/* Economics */}
            <Link href="/quiz" className="group">
              <div className="edu-card bg-gradient-to-br from-accent-1/5 to-accent-2/10 border-2 border-transparent group-hover:border-accent-1">
                <h3 className="text-xl font-display font-semibold text-primary mb-2 break-words">
                  Economics
                </h3>
                <p className="font-body text-text-secondary text-sm mb-4 break-words">18 Chapters Available</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-display font-semibold text-accent-1">Start Learning →</span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Progress Section */}
        <div className="edu-card" data-onboarding="progress-section">
          <h2 className="text-2xl font-display font-bold text-primary mb-6">Your Progress</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-accent-1/5 rounded-lg">
              <TrendingUp className="h-8 w-8 text-accent-1 mx-auto mb-3" />
              <p className="text-3xl font-display font-bold text-primary mb-1">0</p>
              <p className="text-sm font-body text-text-secondary break-words">Quizzes Completed</p>
            </div>
            <div className="text-center p-6 bg-accent-2/5 rounded-lg">
              <Trophy className="h-8 w-8 text-accent-2 mx-auto mb-3" />
              <p className="text-3xl font-display font-bold text-primary mb-1">0</p>
              <p className="text-sm font-body text-text-secondary break-words">Mock Tests Taken</p>
            </div>
            <div className="text-center p-6 bg-accent-1/5 rounded-lg">
              <Target className="h-8 w-8 text-accent-1 mx-auto mb-3" />
              <p className="text-3xl font-display font-bold text-primary mb-1">0%</p>
              <p className="text-sm font-body text-text-secondary break-words">Average Score</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
