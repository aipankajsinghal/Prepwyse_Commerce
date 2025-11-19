"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FileText,
  Clock,
  Calendar,
  TrendingUp,
  Filter,
  Search,
} from "lucide-react";

interface PracticePaper {
  id: string;
  year: number;
  examType: string;
  title: string;
  description?: string;
  duration: number;
  totalMarks: number;
  difficulty: string;
  createdAt: string;
  _count: {
    attempts: number;
  };
}

export default function PracticePapersPage() {
  const router = useRouter();
  const [papers, setPapers] = useState<PracticePaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [examTypeFilter, setExamTypeFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPapers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examTypeFilter, yearFilter]);

  const fetchPapers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (examTypeFilter !== "all") params.append("examType", examTypeFilter);
      if (yearFilter !== "all") params.append("year", yearFilter);

      const response = await fetch(`/api/practice-papers?${params}`);
      const data = await response.json();

      if (response.ok) {
        setPapers(data.papers);
      } else {
        console.error("Failed to fetch papers:", data.error);
      }
    } catch (error) {
      console.error("Error fetching papers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPapers = papers.filter((paper) =>
    searchQuery
      ? paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper.description?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Practice Papers
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Previous year papers and practice tests for CUET, Class 11 & Class 12
          </p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search papers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Exam Type Filter */}
            <div>
              <select
                value={examTypeFilter}
                onChange={(e) => setExamTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Exams</option>
                <option value="CUET">CUET</option>
                <option value="Class11">Class 11</option>
                <option value="Class12">Class 12</option>
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Years</option>
                {[2024, 2023, 2022, 2021, 2020].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Papers Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading practice papers...
            </p>
          </div>
        ) : filteredPapers.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-16 w-16 text-gray-400" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              No practice papers found
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPapers.map((paper, index) => (
              <motion.div
                key={paper.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => router.push(`/practice-papers/${paper.id}`)}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 cursor-pointer border border-gray-200 dark:border-gray-700"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${getExamTypeBadgeColor(
                          paper.examType
                        )}`}
                      >
                        {paper.examType}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${getDifficultyColor(
                          paper.difficulty
                        )}`}
                      >
                        {paper.difficulty}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                      {paper.title}
                    </h3>
                  </div>
                  <FileText className="h-8 w-8 text-blue-500 flex-shrink-0" />
                </div>

                {/* Description */}
                {paper.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {paper.description}
                  </p>
                )}

                {/* Meta Information */}
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Year: {paper.year}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{paper.duration} minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>{paper.totalMarks} marks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>{paper._count.attempts} attempts</span>
                  </div>
                </div>

                {/* Action Button */}
                <button className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                  Start Practice
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
