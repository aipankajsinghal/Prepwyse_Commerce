"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { BookOpen, CheckCircle2, Clock, Play, Sparkles } from "lucide-react";

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
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(10);
  const [duration, setDuration] = useState(15);
  const [useAI, setUseAI] = useState(true);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "adaptive">("adaptive");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

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

  const handleStartQuiz = async () => {
    if (selectedChapters.length === 0) {
      setError("Please select at least one chapter");
      return;
    }

    setIsGenerating(true);
    setError("");
    
    try {
      if (useAI) {
        // Use AI to generate quiz
        const response = await fetch("/api/ai/generate-quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subjectId: selectedSubject,
            chapterIds: selectedChapters,
            questionCount,
            difficulty: difficulty === "adaptive" ? null : difficulty,
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          // More detailed error message
          const errorMessage = data.error || "Failed to generate AI quiz";
          const errorDetails = data.details ? `\n\nDetails: ${data.details}` : "";
          throw new Error(errorMessage + errorDetails);
        }

        // Redirect to quiz attempt page
        if (data.quizId) {
          router.push(`/quiz/${data.quizId}/attempt`);
        } else {
          alert(
            `✨ ${data.message}\nAdaptive difficulty: ${data.adaptiveDifficulty}\n\nQuiz created successfully!`
          );
        }
      } else {
        // Use regular quiz creation
        const response = await fetch("/api/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: `Quiz: ${currentSubject?.name}`,
            subjectId: selectedSubject,
            chapterIds: selectedChapters,
            questionCount,
            duration,
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          const errorMessage = data.error || "Failed to create quiz";
          throw new Error(errorMessage);
        }

        // Redirect to quiz attempt page
        if (data.quizId) {
          router.push(`/quiz/${data.quizId}/attempt`);
        } else {
          alert("Quiz created successfully!");
        }
      }
    } catch (error: any) {
      console.error("Quiz creation error:", error.message || "Unknown error");
      let errorMessage = error.message || "An error occurred";
      if (useAI) {
        errorMessage += ". AI quiz generation requires API keys to be configured. Try disabling AI mode or contact support.";
      } else {
        errorMessage += ". Please try again or contact support.";
      }
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentSubject = subjects.find((s) => s.id === selectedSubject);

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] bg-pattern">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-reveal">
          <h1 className="text-3xl font-display font-bold text-primary mb-2">Create Practice Quiz</h1>
          <p className="font-body text-text-secondary">
            Select subject, chapters, and customize your quiz settings
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Subject & Chapter Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Subject Selection */}
            <div className="edu-card animate-reveal delay-100">
              <h2 className="text-xl font-display font-semibold mb-4 flex items-center text-primary">
                <BookOpen className="h-5 w-5 mr-2 text-accent-1" />
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
                    className={`p-4 border-2 rounded-lg text-left font-display transition ${
                      selectedSubject === subject.id
                        ? "border-accent-1 bg-accent-1/10"
                        : "border-text-primary/10 hover:border-accent-1/50"
                    }`}
                  >
                    <h3 className="font-semibold text-text-primary break-words">{subject.name}</h3>
                    <p className="text-sm font-body text-text-secondary mt-1 break-words">
                      {subject.chapters.length} chapters
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Chapter Selection */}
            {selectedSubject && currentSubject && (
              <div className="edu-card animate-reveal delay-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-display font-semibold flex items-center text-primary">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-accent-1" />
                    Select Chapters
                  </h2>
                  <button
                    onClick={handleSelectAllChapters}
                    className="text-accent-1 hover:text-accent-1-dark font-display font-medium text-sm"
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
                      className="flex items-center p-3 border-2 border-text-primary/10 rounded-lg hover:border-accent-1/50 cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={selectedChapters.includes(chapter.id)}
                        onChange={() => handleChapterToggle(chapter.id)}
                        className="h-4 w-4 text-accent-1 rounded border-text-primary/20 focus:ring-accent-1 flex-shrink-0"
                      />
                      <span className="ml-3 font-body text-text-primary break-words flex-1">{chapter.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Quiz Settings */}
          <div className="space-y-6">
            <div className="edu-card animate-reveal delay-300">
              <h2 className="text-xl font-display font-semibold mb-4 text-primary">Quiz Settings</h2>

              <div className="space-y-4">
                {/* AI Toggle */}
                <div className="p-4 bg-gradient-to-r from-accent-1/10 to-accent-2/10 border-2 border-accent-1/20 rounded-lg">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center">
                      <Sparkles className="h-5 w-5 text-accent-1 mr-2 animate-float" />
                      <div>
                        <span className="font-display font-semibold text-text-primary">AI-Powered Quiz</span>
                        <p className="text-xs font-body text-text-secondary mt-1">
                          Generate questions with AI based on your performance
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={useAI}
                      onChange={(e) => setUseAI(e.target.checked)}
                      className="h-5 w-5 text-accent-1 rounded focus:ring-accent-1"
                    />
                  </label>
                </div>

                {/* Difficulty Selection (only shown when AI is enabled) */}
                {useAI && (
                  <div>
                    <label className="block text-sm font-display font-medium text-text-primary mb-2">
                      Difficulty Level
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as any)}
                      className="w-full px-4 py-2 font-body border border-text-primary/20 rounded-lg focus:ring-2 focus:ring-accent-1 focus:border-transparent bg-surface-elevated"
                    >
                      <option value="adaptive">🎯 Adaptive (Recommended)</option>
                      <option value="easy">😊 Easy</option>
                      <option value="medium">😐 Medium</option>
                      <option value="hard">😰 Hard</option>
                    </select>
                    {difficulty === "adaptive" && (
                      <p className="text-xs font-body text-text-muted mt-1">
                        AI will adjust difficulty based on your recent performance
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-display font-medium text-text-primary mb-2">
                    Number of Questions
                  </label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full px-4 py-2 font-body border border-text-primary/20 rounded-lg focus:ring-2 focus:ring-accent-1 focus:border-transparent bg-surface-elevated"
                  >
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                    <option value={20}>20 Questions</option>
                    <option value={25}>25 Questions</option>
                  </select>
                </div>

                {!useAI && (
                  <div>
                    <label className="block text-sm font-display font-medium text-text-primary mb-2">
                      Duration
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full px-4 py-2 font-body border border-text-primary/20 rounded-lg focus:ring-2 focus:ring-accent-1 focus:border-transparent bg-surface-elevated"
                    >
                      <option value={10}>10 Minutes</option>
                      <option value={15}>15 Minutes</option>
                      <option value={20}>20 Minutes</option>
                      <option value={30}>30 Minutes</option>
                      <option value={45}>45 Minutes</option>
                  </select>
                </div>
                )}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl mb-4">
                <p className="text-red-800 dark:text-red-200 text-sm font-body break-words">{error}</p>
              </div>
            )}

            <div className={`rounded-xl p-6 border-2 ${useAI ? "bg-gradient-to-br from-accent-1/10 to-accent-2/10 border-accent-1/20" : "bg-accent-1/10 border-accent-1/20"}`}>
              <h3 className="font-display font-semibold mb-2 flex items-center text-primary">
                {useAI && <Sparkles className="h-4 w-4 mr-2 text-accent-1 animate-float" />}
                Quiz Summary
              </h3>
              <div className="space-y-2 text-sm font-body">
                {useAI && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Mode:</span>
                    <span className="font-medium text-accent-1">✨ AI-Generated</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-text-secondary">Subject:</span>
                  <span className="font-medium text-text-primary">
                    {currentSubject?.name || "Not selected"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Chapters:</span>
                  <span className="font-medium text-text-primary">{selectedChapters.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Questions:</span>
                  <span className="font-medium text-text-primary">{questionCount}</span>
                </div>
                {useAI && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Difficulty:</span>
                    <span className="font-medium capitalize text-text-primary">{difficulty}</span>
                  </div>
                )}
                {!useAI && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Duration:</span>
                    <span className="font-medium text-text-primary">{duration} min</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleStartQuiz}
                disabled={selectedChapters.length === 0 || isGenerating}
                className={`w-full mt-4 btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${useAI ? 'animate-pulse-subtle' : ''}`}
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full" />
                    Generating...
                  </>
                ) : (
                  <>
                    {useAI ? <Sparkles className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
                    {useAI ? "Generate AI Quiz" : "Start Quiz"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
