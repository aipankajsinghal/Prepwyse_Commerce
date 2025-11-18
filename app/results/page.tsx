"use client";

import Navbar from "@/components/Navbar";
import { Award, Calendar, Clock, FileText, TrendingUp } from "lucide-react";

// Mock data for results
const recentAttempts = [
  {
    id: "1",
    type: "Quiz",
    title: "Business Studies - Chapter 1-3",
    score: 8,
    totalQuestions: 10,
    percentage: 80,
    date: "2024-11-15",
    timeSpent: 12,
  },
  {
    id: "2",
    type: "Mock Test",
    title: "CUET Commerce Full Mock Test 1",
    score: 75,
    totalQuestions: 100,
    percentage: 75,
    date: "2024-11-14",
    timeSpent: 115,
  },
  {
    id: "3",
    type: "Quiz",
    title: "Economics - Market Equilibrium",
    score: 9,
    totalQuestions: 15,
    percentage: 60,
    date: "2024-11-13",
    timeSpent: 18,
  },
];

export default function ResultsPage() {
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-semantic-success";
    if (percentage >= 60) return "text-semantic-warning";
    return "text-semantic-error";
  };

  const getBgColor = (percentage: number) => {
    if (percentage >= 80) return "bg-semantic-success/10 border-semantic-success/20";
    if (percentage >= 60) return "bg-semantic-warning/10 border-semantic-warning/20";
    return "bg-semantic-error/10 border-semantic-error/20";
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] bg-pattern">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-reveal">
          <h1 className="text-3xl font-display font-bold text-primary mb-2">Your Results</h1>
          <p className="font-body text-text-secondary">
            Track your performance and identify areas for improvement
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="edu-card animate-reveal delay-100">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-display text-text-secondary font-medium">Total Attempts</h4>
              <FileText className="h-5 w-5 text-accent-1" />
            </div>
            <p className="text-3xl font-display font-bold text-primary">{recentAttempts.length}</p>
          </div>

          <div className="edu-card animate-reveal delay-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-display text-text-secondary font-medium">Average Score</h4>
              <TrendingUp className="h-5 w-5 text-accent-2" />
            </div>
            <p className="text-3xl font-display font-bold text-primary">72%</p>
          </div>

          <div className="edu-card animate-reveal delay-300">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-display text-text-secondary font-medium">Best Score</h4>
              <Award className="h-5 w-5 text-accent-1" />
            </div>
            <p className="text-3xl font-display font-bold text-primary">80%</p>
          </div>

          <div className="edu-card animate-reveal delay-300">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-display text-text-secondary font-medium">Study Time</h4>
              <Clock className="h-5 w-5 text-accent-1" />
            </div>
            <p className="text-3xl font-display font-bold text-primary">2.4h</p>
          </div>
        </div>

        {/* Recent Attempts */}
        <div className="edu-card animate-reveal delay-300">
          <h2 className="text-2xl font-bold mb-6">Recent Attempts</h2>

          {recentAttempts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="font-body text-text-secondary text-lg">No attempts yet</p>
              <p className="text-gray-500 text-sm mt-2">
                Start practicing to see your results here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className={`border-2 rounded-lg p-6 ${getBgColor(attempt.percentage)}`}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="px-2 py-1 bg-white rounded text-xs font-semibold text-gray-700">
                          {attempt.type}
                        </span>
                        <div className="flex items-center text-sm font-body text-text-secondary">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(attempt.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {attempt.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm font-body text-text-secondary">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-1" />
                          {attempt.score}/{attempt.totalQuestions} correct
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {attempt.timeSpent} min
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 md:mt-0 md:ml-6">
                      <div className="text-right">
                        <div className={`text-4xl font-bold ${getScoreColor(attempt.percentage)}`}>
                          {attempt.percentage}%
                        </div>
                        <button className="mt-2 px-4 py-2 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:border-primary-500 hover:text-primary-600 text-sm font-medium transition">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Performance Analysis */}
        <div className="mt-8 edu-card animate-reveal delay-300">
          <h2 className="text-2xl font-bold mb-4">Subject-wise Performance</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700 font-medium">Business Studies</span>
                <span className="font-body text-text-secondary">78%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "78%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700 font-medium">Accountancy</span>
                <span className="font-body text-text-secondary">65%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "65%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700 font-medium">Economics</span>
                <span className="font-body text-text-secondary">72%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "72%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
