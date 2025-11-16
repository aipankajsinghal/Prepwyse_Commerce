"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { BookOpen, CheckCircle2, Clock, Play } from "lucide-react";

// Mock data - In production, this would come from the database
const subjects = [
  {
    id: "1",
    name: "Business Studies",
    chapters: [
      { id: "1-1", name: "Nature and Significance of Management" },
      { id: "1-2", name: "Principles of Management" },
      { id: "1-3", name: "Business Environment" },
      { id: "1-4", name: "Planning" },
      { id: "1-5", name: "Organizing" },
    ],
  },
  {
    id: "2",
    name: "Accountancy",
    chapters: [
      { id: "2-1", name: "Accounting for Partnership Firms" },
      { id: "2-2", name: "Admission of a Partner" },
      { id: "2-3", name: "Retirement/Death of a Partner" },
      { id: "2-4", name: "Dissolution of Partnership Firm" },
      { id: "2-5", name: "Accounting for Share Capital" },
    ],
  },
  {
    id: "3",
    name: "Economics",
    chapters: [
      { id: "3-1", name: "Introduction to Microeconomics" },
      { id: "3-2", name: "Theory of Consumer Behaviour" },
      { id: "3-3", name: "Production and Costs" },
      { id: "3-4", name: "The Theory of the Firm" },
      { id: "3-5", name: "Market Equilibrium" },
    ],
  },
];

export default function QuizPage() {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(10);
  const [duration, setDuration] = useState(15);

  const handleChapterToggle = (chapterId: string) => {
    setSelectedChapters((prev) =>
      prev.includes(chapterId)
        ? prev.filter((id) => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  const handleSelectAllChapters = () => {
    const subject = subjects.find((s) => s.id === selectedSubject);
    if (subject) {
      const allChapterIds = subject.chapters.map((c) => c.id);
      if (selectedChapters.length === allChapterIds.length) {
        setSelectedChapters([]);
      } else {
        setSelectedChapters(allChapterIds);
      }
    }
  };

  const handleStartQuiz = () => {
    if (selectedChapters.length === 0) {
      alert("Please select at least one chapter");
      return;
    }
    // In production, this would create a quiz and navigate to the quiz page
    alert(`Starting quiz with ${selectedChapters.length} chapters, ${questionCount} questions, ${duration} minutes`);
  };

  const currentSubject = subjects.find((s) => s.id === selectedSubject);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Practice Quiz</h1>
          <p className="text-gray-600">
            Select subject, chapters, and customize your quiz settings
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Subject & Chapter Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Subject Selection */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-primary-600" />
                Select Subject
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {subjects.map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => {
                      setSelectedSubject(subject.id);
                      setSelectedChapters([]);
                    }}
                    className={`p-4 border-2 rounded-lg text-left transition ${
                      selectedSubject === subject.id
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-primary-300"
                    }`}
                  >
                    <h3 className="font-semibold">{subject.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {subject.chapters.length} chapters
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Chapter Selection */}
            {selectedSubject && currentSubject && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold flex items-center">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-primary-600" />
                    Select Chapters
                  </h2>
                  <button
                    onClick={handleSelectAllChapters}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    {selectedChapters.length === currentSubject.chapters.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>
                <div className="space-y-2">
                  {currentSubject.chapters.map((chapter) => (
                    <label
                      key={chapter.id}
                      className="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:border-primary-300 cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={selectedChapters.includes(chapter.id)}
                        onChange={() => handleChapterToggle(chapter.id)}
                        className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                      />
                      <span className="ml-3 text-gray-900">{chapter.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Quiz Settings */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Quiz Settings</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Questions
                  </label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                    <option value={20}>20 Questions</option>
                    <option value={25}>25 Questions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value={10}>10 Minutes</option>
                    <option value={15}>15 Minutes</option>
                    <option value={20}>20 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-primary-50 rounded-xl p-6 border-2 border-primary-200">
              <h3 className="font-semibold mb-2">Quiz Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subject:</span>
                  <span className="font-medium">
                    {currentSubject?.name || "Not selected"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Chapters:</span>
                  <span className="font-medium">{selectedChapters.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Questions:</span>
                  <span className="font-medium">{questionCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{duration} min</span>
                </div>
              </div>

              <button
                onClick={handleStartQuiz}
                disabled={selectedChapters.length === 0}
                className="w-full mt-4 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold flex items-center justify-center transition"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Quiz
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
