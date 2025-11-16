"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Sparkles, TrendingUp, BookOpen, Target, Lightbulb, Loader2 } from "lucide-react";

interface Recommendation {
  id: string;
  type: string;
  title: string;
  description: string;
  content: string[];
  priority: number;
  isRead: boolean;
  createdAt: string;
}

interface Insights {
  weakAreas: string[];
  strongAreas: string[];
  suggestedDifficulty: string;
}

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRecommendations = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch("/api/ai/recommendations");
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch recommendations");
      }

      const data = await response.json();
      setRecommendations(data.recommendations);
      setInsights(data.insights);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "study_plan":
        return <Target className="h-5 w-5" />;
      case "topic":
        return <BookOpen className="h-5 w-5" />;
      case "difficulty_adjustment":
        return <TrendingUp className="h-5 w-5" />;
      case "content":
        return <Lightbulb className="h-5 w-5" />;
      default:
        return <Sparkles className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return "border-red-300 bg-red-50";
    if (priority >= 5) return "border-yellow-300 bg-yellow-50";
    return "border-blue-300 bg-blue-50";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <Sparkles className="h-8 w-8 mr-3 text-purple-600" />
            AI-Powered Recommendations
          </h1>
          <p className="text-gray-600">
            Personalized study suggestions based on your performance and learning patterns
          </p>
        </div>

        {/* Generate Button */}
        <div className="mb-6">
          <button
            onClick={fetchRecommendations}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold flex items-center hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Generating Recommendations...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Generate New Recommendations
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">⚠️ {error}</p>
            <p className="text-sm text-red-600 mt-1">
              Make sure OpenAI API key is configured in environment variables.
            </p>
          </div>
        )}

        {/* Insights Section */}
        {insights && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Weak Areas */}
            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-orange-200">
              <h3 className="font-semibold text-lg mb-3 flex items-center text-orange-700">
                <Target className="h-5 w-5 mr-2" />
                Areas to Improve
              </h3>
              <ul className="space-y-2">
                {insights.weakAreas.length > 0 ? (
                  insights.weakAreas.map((area, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="mr-2">•</span>
                      <span>{area}</span>
                    </li>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Take more quizzes to get insights</p>
                )}
              </ul>
            </div>

            {/* Strong Areas */}
            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-green-200">
              <h3 className="font-semibold text-lg mb-3 flex items-center text-green-700">
                <TrendingUp className="h-5 w-5 mr-2" />
                Your Strengths
              </h3>
              <ul className="space-y-2">
                {insights.strongAreas.length > 0 ? (
                  insights.strongAreas.map((area, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="mr-2">•</span>
                      <span>{area}</span>
                    </li>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Take more quizzes to identify strengths</p>
                )}
              </ul>
            </div>

            {/* Suggested Difficulty */}
            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-purple-200">
              <h3 className="font-semibold text-lg mb-3 flex items-center text-purple-700">
                <Sparkles className="h-5 w-5 mr-2" />
                Recommended Level
              </h3>
              <div className="text-center py-4">
                <p className="text-3xl font-bold text-purple-700 capitalize">
                  {insights.suggestedDifficulty}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Based on your recent performance
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations List */}
        {recommendations.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Personalized Recommendations</h2>
            {recommendations
              .sort((a, b) => b.priority - a.priority)
              .map((rec) => (
                <div
                  key={rec.id}
                  className={`rounded-xl p-6 border-2 ${getPriorityColor(rec.priority)}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-gray-700">{getTypeIcon(rec.type)}</div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{rec.title}</h3>
                        <p className="text-xs text-gray-500 capitalize">{rec.type.replace("_", " ")}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-white rounded text-xs font-semibold">
                        Priority: {rec.priority}/10
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{rec.description}</p>
                  
                  {Array.isArray(rec.content) && rec.content.length > 0 && (
                    <div className="mt-3 bg-white rounded-lg p-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Action Items:</p>
                      <ul className="space-y-1">
                        {rec.content.map((item, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start">
                            <span className="mr-2">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
          </div>
        ) : !loading && !error && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Sparkles className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Recommendations Yet</h3>
            <p className="text-gray-600 mb-6">
              Click "Generate New Recommendations" to get personalized study suggestions based on your performance.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
