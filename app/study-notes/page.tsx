"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen,
  Search,
  Filter,
  ChevronRight,
  FileText,
  Heart,
  Eye,
  Bookmark,
} from "lucide-react";

interface Subject {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  chapters: {
    id: string;
    name: string;
    order: number;
  }[];
}

export default function StudyNotesPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/subjects");
      const data = await response.json();

      if (response.ok) {
        setSubjects(data.subjects);
      } else {
        console.error("Failed to fetch subjects:", data.error);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubjects = subjects.filter((subject) =>
    searchQuery
      ? subject.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const displayedSubjects = selectedSubject
    ? subjects.filter((s) => s.id === selectedSubject)
    : filteredSubjects;

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Study Notes
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive study materials for all subjects and chapters
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          <button
            onClick={() => router.push("/study-notes/bookmarks")}
            className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <Bookmark className="h-6 w-6 text-blue-600" />
              <div className="text-left">
                <p className="font-semibold text-gray-900 dark:text-white">
                  My Bookmarks
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Saved notes
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>

          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </motion.div>

        {/* Subjects and Chapters */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading subjects...
            </p>
          </div>
        ) : displayedSubjects.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-16 w-16 text-gray-400" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              No subjects found
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {displayedSubjects.map((subject, index) => (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
              >
                {/* Subject Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {subject.name}
                      </h2>
                      {subject.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {subject.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Chapters Grid */}
                <div className="p-6">
                  {subject.chapters.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                      No chapters available
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {subject.chapters
                        .sort((a, b) => a.order - b.order)
                        .map((chapter) => (
                          <button
                            key={chapter.id}
                            onClick={() =>
                              router.push(`/study-notes/${chapter.id}`)
                            }
                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left group"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded font-semibold text-sm">
                                {chapter.order}
                              </div>
                              <span className="text-gray-900 dark:text-white font-medium line-clamp-2">
                                {chapter.name}
                              </span>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 flex-shrink-0" />
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
