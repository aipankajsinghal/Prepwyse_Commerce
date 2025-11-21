"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import DOMPurify from "isomorphic-dompurify";
import {
  BookOpen,
  ArrowLeft,
  Heart,
  Eye,
  Bookmark,
  Calendar,
  Download,
  Share2,
} from "lucide-react";

interface StudyNote {
  id: string;
  chapterId: string;
  title: string;
  content: string;
  summary?: string;
  type: string;
  difficulty: string;
  tags?: string[];
  pdfUrl?: string;
  views: number;
  likes: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  isBookmarked: boolean;
}

export default function ViewNotePage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [note, setNote] = useState<StudyNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    fetchNote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchNote = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/study-notes/${params.id}`);
      const data = await response.json();

      if (response.ok) {
        setNote(data.note);
      } else {
        console.error("Failed to fetch note:", data.error);
      }
    } catch (error) {
      console.error("Error fetching note:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!note || liking) return;

    try {
      setLiking(true);
      const response = await fetch(`/api/study-notes/${params.id}/like`, {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setNote(data.note);
      }
    } catch (error) {
      console.error("Error liking note:", error);
    } finally {
      setLiking(false);
    }
  };

  const handleBookmark = async () => {
    if (!note) return;

    try {
      const response = await fetch("/api/study-notes/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId: note.id }),
      });

      const data = await response.json();

      if (response.ok) {
        setNote({ ...note, isBookmarked: data.bookmarked });
      }
    } catch (error) {
      console.error("Error bookmarking note:", error);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: note?.title,
        text: note?.summary || "Check out this study note",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading study note...
          </p>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Study note not found</p>
          <button
            onClick={() => router.push("/study-notes")}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Study Notes
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
          onClick={() => router.push(`/study-notes/${note.chapterId}`)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Chapter
        </button>

        {/* Note Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="p-8 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded ${getDifficultyColor(
                      note.difficulty
                    )}`}
                  >
                    {note.difficulty}
                  </span>
                  {Array.isArray(note.tags) && note.tags.length > 0 && (
                    <>
                      {note.tags.slice(0, 4).map((tag: string) => (
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {note.title}
                </h1>
                {note.summary && (
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    {note.summary}
                  </p>
                )}
              </div>
            </div>

            {/* Meta & Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
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
                  <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleLike}
                  disabled={liking}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Like"
                >
                  <Heart className="h-5 w-5 text-red-500" />
                </button>
                <button
                  onClick={handleBookmark}
                  className={`p-2 rounded-lg transition-colors ${
                    note.isBookmarked
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"
                  }`}
                  title={note.isBookmarked ? "Remove bookmark" : "Bookmark"}
                >
                  <Bookmark
                    className="h-5 w-5"
                    fill={note.isBookmarked ? "currentColor" : "none"}
                  />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Share"
                >
                  <Share2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
                {note.pdfUrl && (
                  <a
                    href={note.pdfUrl}
                    download
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Download PDF"
                  >
                    <Download className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div
              className="prose prose-lg dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  note.content.replace(/\n/g, "<br>"),
                  {
                    ALLOWED_TAGS: [
                      'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
                      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code', 'pre', 'blockquote',
                      'span', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
                    ],
                    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
                  }
                ),
              }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
