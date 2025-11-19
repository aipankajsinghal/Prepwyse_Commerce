"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FileText,
  Clock,
  Calendar,
  TrendingUp,
  ArrowLeft,
  Play,
  BarChart3,
} from "lucide-react";

interface PracticePaper {
  id: string;
  year: number;
  examType: string;
  title: string;
  description?: string;
  duration: number;
  totalMarks: number;
  subjectId?: string;
  questions: any[];
  solutions?: any[];
  difficulty: string;
  createdAt: string;
  _count: {
    attempts: number;
  };
}

export default function PracticePaperDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [paper, setPaper] = useState<PracticePaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingAttempt, setStartingAttempt] = useState(false);

  useEffect(() => {
    fetchPaper();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchPaper = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/practice-papers/${params.id}`);
      const data = await response.json();

      if (response.ok) {
        setPaper(data.paper);
      } else {
        console.error("Failed to fetch paper:", data.error);
      }
    } catch (error) {
      console.error("Error fetching paper:", error);
    } finally {
      setLoading(false);
    }
  };

  const startAttempt = async () => {
    try {
      setStartingAttempt(true);
      const response = await fetch("/api/practice-papers/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paperId: params.id }),
      });

      const data = await response.json();

      if (response.ok) {
        // Navigate to attempt page (reusing quiz attempt UI)
        router.push(`/practice-papers/${params.id}/attempt?attemptId=${data.attempt.id}`);
      } else {
        console.error("Failed to start attempt:", data.error);
        alert("Failed to start practice paper. Please try again.");
      }
    } catch (error) {
      console.error("Error starting attempt:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setStartingAttempt(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-600 bg-green-100 dark:bg-green-900/30";
      case "hard":
        return "text-red-600 bg-red-100 dark:bg-red-900/30";
      default:
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30";
    }
  };

  const getExamTypeBadgeColor = (examType: string) => {
    switch (examType) {
      case "CUET":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
      case "Class11":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      case "Class12":
        return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading practice paper...
          </p>
        </div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Practice paper not found
          </p>
          <button
            onClick={() => router.push("/practice-papers")}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Papers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push("/practice-papers")}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Papers
        </button>

        {/* Paper Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8"
        >
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded ${getExamTypeBadgeColor(
                    paper.examType
                  )}`}
                >
                  {paper.examType}
                </span>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded ${getDifficultyColor(
                    paper.difficulty
                  )}`}
                >
                  {paper.difficulty}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {paper.title}
              </h1>
              {paper.description && (
                <p className="text-gray-600 dark:text-gray-400">
                  {paper.description}
                </p>
              )}
            </div>
          </div>

          {/* Paper Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="text-center">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Year</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {paper.year}
              </p>
            </div>
            <div className="text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {paper.duration} min
              </p>
            </div>
            <div className="text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Marks</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {paper.totalMarks}
              </p>
            </div>
            <div className="text-center">
              <BarChart3 className="h-6 w-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Questions</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {Array.isArray(paper.questions) ? paper.questions.length : 0}
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Instructions
            </h2>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                <span>
                  This is a timed test. You will have {paper.duration} minutes to complete all questions.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                <span>All questions are compulsory.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                <span>You can mark questions for review and return to them later.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                <span>Submit your answers before the time expires.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                <span>Solutions will be available after submission.</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={startAttempt}
              disabled={startingAttempt}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
            >
              {startingAttempt ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Starting...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  Start Practice Paper
                </>
              )}
            </button>
            <button
              onClick={() => router.push("/practice-papers/attempts")}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold transition-colors"
            >
              View My Attempts
            </button>
          </div>

          {/* Stats */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {paper._count.attempts} students have attempted this paper
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
