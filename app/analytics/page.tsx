"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  Award,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";

// Mock data - will be replaced with real API calls
const mockPerformanceData = [
  { date: "Mon", score: 65 },
  { date: "Tue", score: 72 },
  { date: "Wed", score: 68 },
  { date: "Thu", score: 78 },
  { date: "Fri", score: 82 },
  { date: "Sat", score: 85 },
  { date: "Sun", score: 88 },
];

const mockSubjectData = [
  { subject: "Business Studies", score: 85, quizzes: 12, avgTime: "15m" },
  { subject: "Accountancy", score: 72, quizzes: 10, avgTime: "18m" },
  { subject: "Economics", score: 78, quizzes: 8, avgTime: "16m" },
];

const mockChapterData = [
  { chapter: "Business Environment", accuracy: 90, attempts: 5 },
  { chapter: "Planning", accuracy: 85, attempts: 4 },
  { chapter: "Organizing", accuracy: 78, attempts: 6 },
  { chapter: "Directing", accuracy: 72, attempts: 3 },
  { chapter: "Controlling", accuracy: 68, attempts: 4 },
];

const mockWeakAreas = [
  { topic: "Cost Accounting", score: 58, chapter: "Accountancy" },
  { topic: "Market Structures", score: 62, chapter: "Economics" },
  { topic: "Directing Principles", score: 65, chapter: "Business Studies" },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d");

  // Calculate summary stats
  const avgScore = Math.round(
    mockSubjectData.reduce((acc, s) => acc + s.score, 0) / mockSubjectData.length
  );
  const totalQuizzes = mockSubjectData.reduce((acc, s) => acc + s.quizzes, 0);
  const improvement = 12; // Mock improvement percentage

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] bg-pattern">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-primary mb-2">Analytics Dashboard</h1>
          <p className="font-body text-text-secondary">
            Track your performance and identify areas for improvement
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 mb-6">
          {(["7d", "30d", "90d"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                timeRange === range
                  ? "bg-primary-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="edu-card p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-body text-text-secondary font-medium">Average Score</h3>
              <Target className="h-5 w-5 text-primary-600" />
            </div>
            <p className="text-3xl font-display font-bold text-primary">{avgScore}%</p>
            <div className="flex items-center gap-1 mt-2 text-semantic-success text-sm">
              <TrendingUp className="h-4 w-4" />
              <span>+{improvement}% this week</span>
            </div>
          </div>

          <div className="edu-card p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-body text-text-secondary font-medium">Total Quizzes</h3>
              <BarChart3 className="h-5 w-5 text-accent-1" />
            </div>
            <p className="text-3xl font-display font-bold text-primary">{totalQuizzes}</p>
            <p className="text-sm font-body text-text-secondary mt-2">Across all subjects</p>
          </div>

          <div className="edu-card p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-body text-text-secondary font-medium">Study Time</h3>
              <Clock className="h-5 w-5 text-accent-2" />
            </div>
            <p className="text-3xl font-display font-bold text-primary">12.5h</p>
            <p className="text-sm font-body text-text-secondary mt-2">This week</p>
          </div>

          <div className="edu-card p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-body text-text-secondary font-medium">Rank</h3>
              <Award className="h-5 w-5 text-yellow-600" />
            </div>
            <p className="text-3xl font-display font-bold text-primary">Top 15%</p>
            <p className="text-sm font-body text-text-secondary mt-2">Among peers</p>
          </div>
        </div>

        {/* Performance Trend Chart */}
        <div className="edu-card p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary-600" />
              Performance Trend
            </h2>
            <span className="text-sm font-body text-text-secondary">Last 7 days</span>
          </div>
          
          {/* Simple bar chart */}
          <div className="flex items-end justify-between h-64 gap-4">
            {mockPerformanceData.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-gray-200 rounded-t-lg relative" style={{ height: "200px" }}>
                  <div
                    className="absolute bottom-0 w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-lg transition-all duration-500"
                    style={{ height: `${(day.score / 100) * 200}px` }}
                  >
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm font-semibold text-gray-700">
                      {day.score}%
                    </span>
                  </div>
                </div>
                <span className="text-sm font-body text-text-secondary font-medium">{day.date}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Subject-wise Performance */}
          <div className="edu-card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary-600" />
              Subject-wise Performance
            </h2>
            <div className="space-y-4">
              {mockSubjectData.map((subject, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{subject.subject}</span>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-body text-text-secondary">{subject.quizzes} quizzes</span>
                      <span className="font-semibold text-gray-900">{subject.score}%</span>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        subject.score >= 80
                          ? "bg-green-500"
                          : subject.score >= 70
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${subject.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weak Areas */}
          <div className="edu-card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Areas Needing Attention
            </h2>
            <div className="space-y-4">
              {mockWeakAreas.map((area, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">{area.topic}</h3>
                    <p className="text-sm font-body text-text-secondary">{area.chapter}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600">{area.score}%</p>
                    <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                      Practice →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chapter-wise Accuracy */}
        <div className="edu-card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary-600" />
            Chapter-wise Accuracy
          </h2>
          <div className="space-y-3">
            {mockChapterData.map((chapter, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-900">{chapter.chapter}</span>
                    <span className="text-sm font-body text-text-secondary">{chapter.attempts} attempts</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        chapter.accuracy >= 80
                          ? "bg-green-500"
                          : chapter.accuracy >= 70
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${chapter.accuracy}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                  {chapter.accuracy}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Insights Section */}
        <div className="mt-8 bg-gradient-to-r from-primary-50 to-blue-50 border-2 border-primary-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary-600" />
            AI Insights & Recommendations
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-primary-600 font-bold">•</span>
              <span>Your performance in <strong>Business Studies</strong> is excellent! Keep up the good work.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 font-bold">•</span>
              <span>Focus more on <strong>Cost Accounting</strong> - your score here is below average.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-semantic-success font-bold">•</span>
              <span>You&apos;re improving consistently! Your scores have increased by <strong>12%</strong> this week.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent-1 font-bold">•</span>
              <span>Predicted exam score based on current performance: <strong>78-82%</strong></span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
