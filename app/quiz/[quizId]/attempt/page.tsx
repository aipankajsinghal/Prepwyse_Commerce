"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuizAttempt } from "@/lib/core/assessment/useQuizAttempt";
import Navbar from "@/components/Navbar";
import { Clock, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, Flag } from "lucide-react";

type Question = {
  id: string;
  questionText: string;
  options: string[];
  chapterId: string;
};

type Quiz = {
  id: string;
  title: string;
  duration: number;
  questionCount: number;
};

type QuizAttempt = {
  id: string;
  currentQuestionIndex: number;
  timeRemaining: number | null;
  durationSeconds: number | null;
  answers: Array<{
    questionId: string;
    selectedAnswer?: string;
    markedForReview?: boolean;
    answeredAt?: string;
  }>;
};

export default function QuizAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saving" | "saved" | "">("");

  // Initialize quiz attempt hook only after we have attempt data
  const quizAttemptHook = attempt
    ? useQuizAttempt({
        attemptId: attempt.id,
        totalQuestions: questions.length,
        initialQuestionIndex: attempt.currentQuestionIndex,
        initialTimeRemaining: attempt.timeRemaining,
        initialAnswers: attempt.answers,
      })
    : null;

  // Load quiz, questions, and create/resume attempt
  useEffect(() => {
    const loadQuizAndAttempt = async () => {
      try {
        // Load quiz details
        const quizRes = await fetch(`/api/quizzes/${quizId}`);
        if (!quizRes.ok) throw new Error("Failed to load quiz");
        const quizData = await quizRes.json();
        setQuiz(quizData.quiz);

        // Load questions
        const questionsRes = await fetch(`/api/quizzes/${quizId}/questions`);
        if (!questionsRes.ok) throw new Error("Failed to load questions");
        const questionsData = await questionsRes.json();
        setQuestions(questionsData.questions);

        // Create or resume attempt
        const attemptRes = await fetch(`/api/quizzes/${quizId}/attempts`, {
          method: "POST",
        });
        if (!attemptRes.ok) throw new Error("Failed to create attempt");
        const attemptData = await attemptRes.json();
        setAttempt(attemptData.attempt);
      } catch (error) {
        console.error("Error loading quiz:", error);
        alert("Failed to load quiz. Redirecting to quiz page.");
        router.push("/quiz");
      } finally {
        setIsLoading(false);
      }
    };

    loadQuizAndAttempt();
  }, [quizId, router]);

  // Show auto-save feedback
  useEffect(() => {
    if (quizAttemptHook) {
      setAutoSaveStatus("saving");
      const timer = setTimeout(() => {
        setAutoSaveStatus("saved");
        setTimeout(() => setAutoSaveStatus(""), 2000);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [quizAttemptHook?.answers, quizAttemptHook?.currentQuestionIndex]);

  // Handle time expired
  useEffect(() => {
    if (quizAttemptHook?.timeRemaining === 0) {
      handleSubmit();
    }
  }, [quizAttemptHook?.timeRemaining]);

  const handleSubmit = async () => {
    if (!attempt || isSubmitting) return;

    const confirmed = window.confirm(
      "Are you sure you want to submit the quiz? This action cannot be undone."
    );
    if (!confirmed) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/attempts/${attempt.id}/submit`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to submit quiz");
      const data = await res.json();
      router.push(`/results/${attempt.id}`);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      alert("Failed to submit quiz. Please try again.");
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading || !quiz || !questions.length || !attempt || !quizAttemptHook) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Loading quiz...</p>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[quizAttemptHook.currentQuestionIndex];
  const currentAnswer = quizAttemptHook.answers[currentQuestion.id];
  const answeredCount = Object.values(quizAttemptHook.answers).filter(
    (a) => a.selectedAnswer
  ).length;
  const markedForReviewCount = Object.values(quizAttemptHook.answers).filter(
    (a) => a.markedForReview
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container mx-auto px-4 py-6">
        {/* Header with Timer and Progress */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
              <p className="text-sm text-gray-600 mt-1">
                Question {quizAttemptHook.currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>

            <div className="flex items-center gap-6">
              {/* Timer */}
              {quizAttemptHook.timeRemaining !== null && (
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    quizAttemptHook.timeRemaining < 60
                      ? "bg-red-100 text-red-700"
                      : quizAttemptHook.timeRemaining < 300
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  <Clock className="h-5 w-5" />
                  <span className="font-bold text-lg">
                    {formatTime(quizAttemptHook.timeRemaining)}
                  </span>
                </div>
              )}

              {/* Stats */}
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Answered: {answeredCount}</span>
                </div>
                {markedForReviewCount > 0 && (
                  <div className="flex items-center gap-1 text-sm text-orange-600">
                    <Flag className="h-4 w-4" />
                    <span>Marked: {markedForReviewCount}</span>
                  </div>
                )}
              </div>

              {/* Auto-save indicator */}
              {autoSaveStatus && (
                <div className="text-xs text-gray-500">
                  {autoSaveStatus === "saving" ? "Saving..." : "✓ Saved"}
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300"
                style={{ width: `${quizAttemptHook.progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1 text-right">
              {Math.round(quizAttemptHook.progressPercent)}% Complete
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-md p-6">
              {/* Question */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex-1">
                    {currentQuestion.questionText}
                  </h2>
                  <button
                    onClick={() =>
                      quizAttemptHook.toggleMarkForReview(currentQuestion.id)
                    }
                    className={`ml-4 flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition ${
                      currentAnswer?.markedForReview
                        ? "bg-orange-100 text-orange-700 border-2 border-orange-300"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Flag className="h-4 w-4" />
                    {currentAnswer?.markedForReview ? "Marked" : "Mark for Review"}
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = currentAnswer?.selectedAnswer === option;
                  return (
                    <button
                      key={index}
                      onClick={() =>
                        quizAttemptHook.setAnswer(currentQuestion.id, option)
                      }
                      className={`w-full text-left p-4 border-2 rounded-lg transition ${
                        isSelected
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start">
                        <div
                          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                            isSelected
                              ? "border-primary-500 bg-primary-500"
                              : "border-gray-300"
                          }`}
                        >
                          {isSelected && (
                            <div className="w-3 h-3 bg-white rounded-full" />
                          )}
                        </div>
                        <span className="flex-1">{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6 pt-6 border-t">
                <button
                  onClick={() =>
                    quizAttemptHook.setCurrentQuestionIndex(
                      Math.max(0, quizAttemptHook.currentQuestionIndex - 1)
                    )
                  }
                  disabled={quizAttemptHook.currentQuestionIndex === 0}
                  className="flex items-center gap-2 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="h-5 w-5" />
                  Previous
                </button>

                {quizAttemptHook.currentQuestionIndex === questions.length - 1 ? (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Quiz"}
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      quizAttemptHook.setCurrentQuestionIndex(
                        Math.min(
                          questions.length - 1,
                          quizAttemptHook.currentQuestionIndex + 1
                        )
                      )
                    }
                    className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition"
                  >
                    Next
                    <ChevronRight className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Question Navigation Grid */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-4 sticky top-6">
              <h3 className="font-semibold text-gray-900 mb-4">Question Palette</h3>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {questions.map((q, index) => {
                  const answer = quizAttemptHook.answers[q.id];
                  const isAnswered = !!answer?.selectedAnswer;
                  const isMarked = answer?.markedForReview;
                  const isCurrent = index === quizAttemptHook.currentQuestionIndex;

                  return (
                    <button
                      key={q.id}
                      onClick={() => quizAttemptHook.setCurrentQuestionIndex(index)}
                      className={`aspect-square rounded-lg font-medium text-sm transition ${
                        isCurrent
                          ? "ring-2 ring-primary-500 ring-offset-2"
                          : ""
                      } ${
                        isAnswered && isMarked
                          ? "bg-orange-500 text-white hover:bg-orange-600"
                          : isAnswered
                          ? "bg-green-500 text-white hover:bg-green-600"
                          : isMarked
                          ? "bg-orange-200 text-orange-800 hover:bg-orange-300"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="space-y-2 text-xs border-t pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-200 rounded" />
                  <span>Marked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded" />
                  <span>Answered & Marked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded" />
                  <span>Not Visited</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isSubmitting ? "Submitting..." : "Submit Quiz"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
