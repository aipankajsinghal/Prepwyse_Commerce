"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Flag,
  CheckCircle2,
  Circle,
  AlertCircle,
  Home
} from "lucide-react";

interface Question {
  id: string;
  questionNumber: number;
  section: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty: string;
}

interface MockTestData {
  id: string;
  title: string;
  examType: string;
  duration: number;
  totalQuestions: number;
  sections: any[];
}

interface Answer {
  questionId: string;
  selectedAnswer: string;
  markedForReview: boolean;
}

export default function MockTestAttemptPage() {
  const router = useRouter();
  const params = useParams();
  const attemptId = params?.attemptId as string;

  const [mockTest, setMockTest] = useState<MockTestData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Map<string, Answer>>(new Map());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch mock test attempt data
  useEffect(() => {
    const fetchAttemptData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/mock-tests/attempt/${attemptId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch mock test data");
        }
        
        const data = await response.json();
        setMockTest(data.mockTest);
        setQuestions(data.questions);
        setTimeRemaining(data.mockTest.duration * 60); // Convert to seconds
        
        // Initialize answers map
        const answersMap = new Map<string, Answer>();
        if (data.existingAnswers && Array.isArray(data.existingAnswers)) {
          data.existingAnswers.forEach((answer: Answer) => {
            answersMap.set(answer.questionId, answer);
          });
        }
        setAnswers(answersMap);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        console.error("Error fetching mock test attempt:", errorMessage);
        setError("Failed to load mock test. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (attemptId) {
      fetchAttemptData();
    }
  }, [attemptId]);

  // Timer countdown
  useEffect(() => {
    if (!mockTest || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mockTest, timeRemaining]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (option: string) => {
    if (!currentQuestion) return;

    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      selectedAnswer: option,
      markedForReview: answers.get(currentQuestion.id)?.markedForReview || false,
    };

    setAnswers(new Map(answers.set(currentQuestion.id, newAnswer)));

    // Auto-save answer to backend
    saveAnswer(newAnswer);
  };

  const toggleMarkForReview = () => {
    if (!currentQuestion) return;

    const existingAnswer = answers.get(currentQuestion.id);
    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      selectedAnswer: existingAnswer?.selectedAnswer || "",
      markedForReview: !existingAnswer?.markedForReview,
    };

    setAnswers(new Map(answers.set(currentQuestion.id, newAnswer)));
    saveAnswer(newAnswer);
  };

  const saveAnswer = async (answer: Answer) => {
    try {
      await fetch(`/api/mock-tests/attempt/${attemptId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answer),
      });
    } catch (error) {
      console.error("Failed to save answer:", error);
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;

    const confirmed = window.confirm(
      "Are you sure you want to submit the mock test? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setSubmitting(true);
      
      const response = await fetch(`/api/mock-tests/attempt/${attemptId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: Array.from(answers.values()),
          timeSpent: mockTest ? (mockTest.duration * 60 - timeRemaining) : 0,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit mock test");
      }

      const result = await response.json();
      
      // Redirect to results page
      router.push(`/results/mock-test/${attemptId}`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("Error submitting mock test:", errorMessage);
      setError("Failed to submit mock test. Please try again.");
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getQuestionStatus = (index: number) => {
    const question = questions[index];
    if (!question) return "unanswered";

    const answer = answers.get(question.id);
    if (!answer || !answer.selectedAnswer) return "unanswered";
    if (answer.markedForReview) return "marked";
    return "answered";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg))] bg-pattern">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-accent-1 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-text-secondary font-body">Loading mock test...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !mockTest || !currentQuestion) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg))] bg-pattern">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="edu-card text-center py-12">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-display font-semibold text-text-primary mb-2">
              {error || "Mock test not found"}
            </h3>
            <button
              onClick={() => router.push("/mock-test")}
              className="btn-primary mt-4"
            >
              <Home className="h-5 w-5 mr-2" />
              Back to Mock Tests
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentAnswer = answers.get(currentQuestion.id);
  const answeredCount = Array.from(answers.values()).filter(a => a.selectedAnswer).length;
  const markedCount = Array.from(answers.values()).filter(a => a.markedForReview).length;

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] bg-pattern">
      <Navbar />

      {/* Header with Timer */}
      <div className="bg-white dark:bg-gray-800 border-b-2 border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-display font-bold text-text-primary">
                {mockTest.title}
              </h1>
              <p className="text-sm text-text-secondary">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            <div className={`flex items-center space-x-2 px-6 py-3 rounded-lg ${
              timeRemaining < 300 ? "bg-red-100 dark:bg-red-900/20" : "bg-accent-1/10"
            }`}>
              <Clock className={`h-5 w-5 ${
                timeRemaining < 300 ? "text-red-600 dark:text-red-400" : "text-accent-1"
              }`} />
              <span className={`text-lg font-mono font-bold ${
                timeRemaining < 300 ? "text-red-600 dark:text-red-400" : "text-accent-1"
              }`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Question Panel */}
          <div className="lg:col-span-3">
            <div className="edu-card">
              {/* Section Badge */}
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-accent-2/10 text-accent-2 text-sm font-medium rounded-lg">
                  {currentQuestion.section}
                </span>
              </div>

              {/* Question */}
              <div className="mb-6">
                <h2 className="text-lg font-display font-semibold text-text-primary mb-4">
                  Q{currentQuestion.questionNumber}. {currentQuestion.questionText}
                </h2>

                {/* Options */}
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = currentAnswer?.selectedAnswer === option;
                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(option)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? "border-accent-1 bg-accent-1/10"
                            : "border-gray-200 dark:border-gray-700 hover:border-accent-1/50 bg-white dark:bg-gray-800"
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center mr-3 ${
                            isSelected
                              ? "border-accent-1 bg-accent-1 text-white"
                              : "border-gray-300 dark:border-gray-600"
                          }`}>
                            {isSelected ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : (
                              <Circle className="h-5 w-5" />
                            )}
                          </div>
                          <span className="text-text-primary font-body">{option}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t-2 border-gray-100 dark:border-gray-700">
                <div className="flex space-x-3">
                  <button
                    onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5 mr-2" />
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                    disabled={currentQuestionIndex === questions.length - 1}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="h-5 w-5 ml-2" />
                  </button>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={toggleMarkForReview}
                    className={`btn-secondary ${
                      currentAnswer?.markedForReview ? "bg-yellow-100 dark:bg-yellow-900/20 border-yellow-400" : ""
                    }`}
                  >
                    <Flag className="h-5 w-5 mr-2" />
                    {currentAnswer?.markedForReview ? "Unmark" : "Mark for Review"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Question Palette */}
          <div className="lg:col-span-1">
            <div className="edu-card sticky top-24">
              <h3 className="text-lg font-display font-semibold text-text-primary mb-4">
                Question Palette
              </h3>

              {/* Status Summary */}
              <div className="mb-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-semantic-success rounded mr-2" />
                    <span className="text-text-secondary">Answered</span>
                  </div>
                  <span className="font-semibold text-text-primary">{answeredCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-yellow-400 rounded mr-2" />
                    <span className="text-text-secondary">Marked</span>
                  </div>
                  <span className="font-semibold text-text-primary">{markedCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded mr-2" />
                    <span className="text-text-secondary">Unanswered</span>
                  </div>
                  <span className="font-semibold text-text-primary">
                    {questions.length - answeredCount}
                  </span>
                </div>
              </div>

              {/* Question Grid */}
              <div className="grid grid-cols-5 gap-2 mb-4">
                {questions.map((_, index) => {
                  const status = getQuestionStatus(index);
                  return (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`h-10 rounded font-semibold text-sm transition-all ${
                        index === currentQuestionIndex
                          ? "ring-2 ring-accent-1 ring-offset-2"
                          : ""
                      } ${
                        status === "answered"
                          ? "bg-semantic-success text-white"
                          : status === "marked"
                          ? "bg-yellow-400 text-gray-900"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Submit Test
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
