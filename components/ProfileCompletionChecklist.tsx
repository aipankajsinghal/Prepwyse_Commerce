"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Circle, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  link?: string;
}

export function ProfileCompletionChecklist() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [items, setItems] = useState<ChecklistItem[]>([
    {
      id: "profile",
      title: "Complete Your Profile",
      description: "Add your name and grade level",
      completed: false,
      link: "/profile",
    },
    {
      id: "first-quiz",
      title: "Take Your First Quiz",
      description: "Complete a practice quiz to get started",
      completed: false,
      link: "/quiz",
    },
    {
      id: "set-goal",
      title: "Set Your Study Goal",
      description: "Define your target exam and timeline",
      completed: false,
      link: "/profile",
    },
    {
      id: "explore-subjects",
      title: "Explore All Subjects",
      description: "Browse through Business Studies, Accountancy, and Economics",
      completed: false,
      link: "/dashboard",
    },
    {
      id: "mock-test",
      title: "Attempt a Mock Test",
      description: "Try a full-length mock test",
      completed: false,
      link: "/mock-test",
    },
  ]);

  useEffect(() => {
    // Load completion status from localStorage
    const savedProgress = localStorage.getItem("profile_checklist");
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        setItems((prev) =>
          prev.map((item) => ({
            ...item,
            completed: progress[item.id] || false,
          }))
        );
      } catch (error) {
        console.error("Failed to load checklist progress:", error);
      }
    }
  }, []);

  const completedCount = items.filter((item) => item.completed).length;
  const progress = (completedCount / items.length) * 100;

  // Don't show if all items are completed
  if (completedCount === items.length) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Complete Your Profile
          </h3>
          <p className="text-sm text-gray-600">
            {completedCount} of {items.length} tasks completed
          </p>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700 transition"
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist items */}
      {isExpanded && (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-start gap-3 p-3 rounded-lg transition ${
                item.completed
                  ? "bg-green-50 border border-green-200"
                  : "bg-gray-50 border border-gray-200 hover:border-primary-300"
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {item.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4
                  className={`text-sm font-medium ${
                    item.completed ? "text-green-900 line-through" : "text-gray-900"
                  }`}
                >
                  {item.title}
                </h4>
                <p className="text-xs text-gray-600 mt-0.5">{item.description}</p>
              </div>
              {!item.completed && item.link && (
                <Link
                  href={item.link}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium whitespace-nowrap"
                >
                  Start →
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Motivational message */}
      {isExpanded && completedCount > 0 && completedCount < items.length && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            🎯 Great progress! Complete {items.length - completedCount} more{" "}
            {items.length - completedCount === 1 ? "task" : "tasks"} to unlock your full
            potential.
          </p>
        </div>
      )}
    </div>
  );
}
