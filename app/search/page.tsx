"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  FileText,
  BookOpen,
  Calendar,
  Filter,
  X,
  Clock,
  TrendingUp,
} from "lucide-react";

interface SearchResults {
  query: string;
  total: number;
  chapters: any[];
  questions: any[];
  notes: any[];
  papers: any[];
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [filters, setFilters] = useState({
    type: "all",
    difficulty: "all",
  });

  const performSearch = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) return;

    try {
      setLoading(true);
      const params = new URLSearchParams({ q: query });
      if (filters.type !== "all") params.append("type", filters.type);
      if (filters.difficulty !== "all")
        params.append("difficulty", filters.difficulty);

      const response = await fetch(`/api/search?${params}`);
      const data = await response.json();

      if (response.ok) {
        setResults(data);
      } else {
        console.error("Search failed:", data.error);
      }
    } catch (error) {
      console.error("Error performing search:", error);
    } finally {
      setLoading(false);
    }
  }, [filters.type, filters.difficulty]);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery, performSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery);
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const clearFilters = () => {
    setFilters({ type: "all", difficulty: "all" });
    if (searchQuery) {
      performSearch(searchQuery);
    }
  };

  const getResultsCount = () => {
    if (!results) return 0;
    switch (activeTab) {
      case "chapters":
        return results.chapters.length;
      case "questions":
        return results.questions.length;
      case "notes":
        return results.notes.length;
      case "papers":
        return results.papers.length;
      default:
        return results.total;
    }
  };

  const renderResults = () => {
    if (!results) return null;

    const items =
      activeTab === "all"
        ? [
            ...results.chapters.map((item) => ({ ...item, type: "chapter" })),
            ...results.questions.map((item) => ({ ...item, type: "question" })),
            ...results.notes.map((item) => ({ ...item, type: "note" })),
            ...results.papers.map((item) => ({ ...item, type: "paper" })),
          ]
        : results[activeTab as keyof typeof results] || [];

    if (Array.isArray(items) && items.length === 0) {
      return (
        <div className="text-center py-12">
          <Search className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No results found</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {Array.isArray(items) &&
          items.map((item: any, index: number) => (
            <motion.div
              key={`${item.id}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all p-6 cursor-pointer"
              onClick={() => {
                if (item.type === "chapter") {
                  router.push(`/study-notes/${item.id}`);
                } else if (item.type === "question") {
                  // Navigate to quiz or question details
                } else if (item.type === "note") {
                  router.push(`/study-notes/view/${item.id}`);
                } else if (item.type === "paper") {
                  router.push(`/practice-papers/${item.id}`);
                }
              }}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  {item.type === "chapter" && (
                    <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  )}
                  {item.type === "question" && (
                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  )}
                  {item.type === "note" && (
                    <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  )}
                  {item.type === "paper" && (
                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                      {item.type}
                    </span>
                    {item.difficulty && (
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          item.difficulty === "easy"
                            ? "text-green-600 bg-green-100 dark:bg-green-900/30"
                            : item.difficulty === "hard"
                            ? "text-red-600 bg-red-100 dark:bg-red-900/30"
                            : "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30"
                        }`}
                      >
                        {item.difficulty}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {item.title || item.name || item.questionText?.substring(0, 100)}
                  </h3>
                  {(item.description || item.summary) && (
                    <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                      {item.description || item.summary}
                    </p>
                  )}
                  {item.type === "chapter" && item.subject && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Subject: {item.subject.name}
                    </p>
                  )}
                  {item.type === "paper" && (
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {item.year}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {item.duration} min
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        {item.totalMarks} marks
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Search Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Search
          </h1>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for chapters, questions, notes, practice papers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
          </form>

          {/* Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <select
              value={filters.type}
              onChange={(e) => {
                setFilters({ ...filters, type: e.target.value });
                setActiveTab(e.target.value);
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="chapters">Chapters</option>
              <option value="questions">Questions</option>
              <option value="notes">Study Notes</option>
              <option value="papers">Practice Papers</option>
            </select>

            <select
              value={filters.difficulty}
              onChange={(e) =>
                setFilters({ ...filters, difficulty: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            {(filters.type !== "all" || filters.difficulty !== "all") && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
                Clear filters
              </button>
            )}
          </div>
        </motion.div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Searching...</p>
          </div>
        ) : results ? (
          <>
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                Found {getResultsCount()} result{getResultsCount() !== 1 ? "s" : ""}{" "}
                for &quot;{results.query}&quot;
              </p>
            </div>
            {renderResults()}
          </>
        ) : (
          <div className="text-center py-12">
            <Search className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Enter a search query to find chapters, questions, study notes, and practice papers
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
