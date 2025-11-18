"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Bookmark, ArrowLeft, BookOpen, Calendar, Eye, Heart } from "lucide-react";

interface BookmarkedNote {
  id: string;
  chapterId: string;
  title: string;
  summary?: string;
  type: string;
  difficulty: string;
  tags?: string[];
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
  isBookmarked: boolean;
  bookmarkedAt: string;
}

export default function BookmarksPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<BookmarkedNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/study-notes/bookmarks");
      const data = await response.json();

      if (response.ok) {
        setNotes(data.notes);
      } else {
        console.error("Failed to fetch bookmarks:", data.error);
      }
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnbookmark = async (noteId: string) => {
    try {
      const response = await fetch("/api/study-notes/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId }),
      });

      if (response.ok) {
        // Remove from local state
        setNotes(notes.filter((note) => note.id !== noteId));
      }
    } catch (error) {
      console.error("Error removing bookmark:", error);
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push("/study-notes")}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Study Notes
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Bookmark className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                My Bookmarks
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Your saved study notes
              </p>
            </div>
          </div>
        </motion.div>

        {/* Bookmarks List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading bookmarks...
            </p>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12">
            <Bookmark className="mx-auto h-16 w-16 text-gray-400" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              No bookmarked notes yet
            </p>
            <button
              onClick={() => router.push("/study-notes")}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Browse Study Notes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {notes.map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${getDifficultyColor(
                            note.difficulty
                          )}`}
                        >
                          {note.difficulty}
                        </span>
                        {Array.isArray(note.tags) && note.tags.length > 0 && (
                          <>
                            {note.tags.slice(0, 3).map((tag: string) => (
                              <span
                                key={tag}
                                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </>
                        )}
                      </div>
                      <h3
                        onClick={() => router.push(`/study-notes/view/${note.id}`)}
                        className="text-xl font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer mb-2"
                      >
                        {note.title}
                      </h3>
                      {note.summary && (
                        <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                          {note.summary}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleUnbookmark(note.id)}
                      className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                      title="Remove bookmark"
                    >
                      <Bookmark className="h-5 w-5" fill="currentColor" />
                    </button>
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{note.views} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      <span>{note.likes} likes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Bookmarked {new Date(note.bookmarkedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => router.push(`/study-notes/view/${note.id}`)}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Read Full Note
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
