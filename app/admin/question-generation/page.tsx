"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  X,
  AlertCircle,
  Search,
  Filter,
  ChevronDown,
  Sparkles,
  TrendingUp,
  Clock,
  BarChart3,
  FileText,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

interface GeneratedQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: string;
  qualityScore: number;
  status: string;
  chapterId: string;
  job: {
    adminName: string;
    createdAt: string;
  };
}

interface Job {
  id: string;
  adminName: string;
  questionCount: number;
  status: string;
  progress: number;
  totalGenerated: number;
  totalApproved: number;
  totalRejected: number;
  createdAt: string;
}

export default function QuestionGenerationReviewPage() {
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("pending_review");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, selectedJob]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load jobs
      const jobsRes = await fetch("/api/question-generation/jobs");
      const jobsData = await jobsRes.json();
      setJobs(jobsData.jobs || []);

      // Load questions
      const params = new URLSearchParams({
        status: statusFilter,
        limit: "50",
      });
      if (selectedJob) {
        params.append("jobId", selectedJob);
      }

      const questionsRes = await fetch(`/api/question-generation/questions?${params}`);
      const questionsData = await questionsRes.json();
      setQuestions(questionsData.questions || []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (questionId: string, action: string) => {
    setProcessing(questionId);
    try {
      const res = await fetch("/api/question-generation/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, action }),
      });

      if (res.ok) {
        await loadData();
      }
    } catch (error) {
      console.error("Failed to review question:", error);
      alert("Failed to review question. Please try again.");
    } finally {
      setProcessing(null);
    }
  };

  const handleBatchApprove = async () => {
    if (selectedQuestions.size === 0) return;

    setProcessing("batch");
    try {
      const res = await fetch("/api/question-generation/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batch: true,
          questionIds: Array.from(selectedQuestions),
        }),
      });

      if (res.ok) {
        setSelectedQuestions(new Set());
        await loadData();
      }
    } catch (error) {
      console.error("Failed to batch approve:", error);
      alert("Failed to batch approve. Please try again.");
    } finally {
      setProcessing(null);
    }
  };

  const toggleSelection = (questionId: string) => {
    const newSelection = new Set(selectedQuestions);
    if (newSelection.has(questionId)) {
      newSelection.delete(questionId);
    } else {
      newSelection.add(questionId);
    }
    setSelectedQuestions(newSelection);
  };

  const getQualityColor = (score: number) => {
    if (score >= 0.85) return "text-semantic-success";
    if (score >= 0.7) return "text-semantic-warning";
    return "text-semantic-error";
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-semantic-success/10 text-semantic-success";
      case "medium":
        return "bg-semantic-warning/10 text-semantic-warning";
      case "hard":
        return "bg-semantic-error/10 text-semantic-error";
      default:
        return "bg-text-muted/10 text-text-muted";
    }
  };

  if (loading && questions.length === 0) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg))] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="h-12 w-12 text-accent-1" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] bg-pattern">
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center space-x-2 mb-4 px-4 py-2 rounded-full bg-accent-1/10 text-accent-1">
                <FileText className="h-5 w-5" />
                <span className="font-display font-semibold">Admin Panel</span>
              </div>
              <h1 className="font-display text-5xl font-bold text-text-primary">
                Question Review Dashboard
              </h1>
              <p className="text-xl text-text-secondary mt-2">
                Review and approve AI-generated questions
              </p>
            </div>
            {selectedQuestions.size > 0 && (
              <button
                onClick={handleBatchApprove}
                disabled={processing === "batch"}
                className="btn-primary"
              >
                <ThumbsUp className="inline h-5 w-5 mr-2" />
                Approve {selectedQuestions.size} Selected
              </button>
            )}
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="edu-card"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-text-muted text-sm mb-1">Total Jobs</div>
                <div className="font-display text-3xl font-bold text-accent-1">
                  {jobs.length}
                </div>
              </div>
              <BarChart3 className="h-10 w-10 text-accent-1/30" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="edu-card"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-text-muted text-sm mb-1">Pending Review</div>
                <div className="font-display text-3xl font-bold text-accent-2">
                  {questions.filter((q) => q.status === "pending_review").length}
                </div>
              </div>
              <Clock className="h-10 w-10 text-accent-2/30" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="edu-card"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-text-muted text-sm mb-1">Total Approved</div>
                <div className="font-display text-3xl font-bold text-semantic-success">
                  {jobs.reduce((sum, job) => sum + job.totalApproved, 0)}
                </div>
              </div>
              <Check className="h-10 w-10 text-semantic-success/30" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="edu-card"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-text-muted text-sm mb-1">High Quality</div>
                <div className="font-display text-3xl font-bold text-primary">
                  {questions.filter((q) => q.qualityScore >= 0.85).length}
                </div>
              </div>
              <Sparkles className="h-10 w-10 text-primary/30" />
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center space-x-4 mb-8"
        >
          <div className="flex-1 flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-surface-elevated border border-text-primary/10 rounded-xl px-4 py-3 font-display appearance-none cursor-pointer"
              >
                <option value="pending_review">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="needs_revision">Needs Revision</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted pointer-events-none" />
            </div>

            <div className="relative flex-1 max-w-md">
              <select
                value={selectedJob || ""}
                onChange={(e) => setSelectedJob(e.target.value || null)}
                className="w-full bg-surface-elevated border border-text-primary/10 rounded-xl px-4 py-3 font-display appearance-none cursor-pointer"
              >
                <option value="">All Jobs</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.adminName} - {new Date(job.createdAt).toLocaleDateString()}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted pointer-events-none" />
            </div>
          </div>
        </motion.div>

        {/* Questions List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-6"
        >
          {questions.length === 0 ? (
            <div className="edu-card text-center py-12">
              <FileText className="h-16 w-16 mx-auto mb-4 text-text-muted opacity-30" />
              <p className="text-text-muted">No questions found for the selected filters.</p>
            </div>
          ) : (
            questions.map((question, idx) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + idx * 0.05 }}
                className="edu-card"
              >
                <div className="flex items-start space-x-4">
                  {/* Selection Checkbox */}
                  {statusFilter === "pending_review" && (
                    <input
                      type="checkbox"
                      checked={selectedQuestions.has(question.id)}
                      onChange={() => toggleSelection(question.id)}
                      className="mt-1 w-5 h-5 rounded border-2 border-accent-1 text-accent-1 focus:ring-accent-1"
                    />
                  )}

                  <div className="flex-1">
                    {/* Question Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-display font-semibold ${getDifficultyColor(
                            question.difficulty
                          )}`}
                        >
                          {question.difficulty}
                        </span>
                        <div
                          className={`font-display font-bold ${getQualityColor(
                            question.qualityScore
                          )}`}
                        >
                          {(question.qualityScore * 100).toFixed(0)}% Quality
                        </div>
                      </div>
                      <div className="text-right text-sm text-text-muted">
                        <div>{question.job.adminName}</div>
                        <div>{new Date(question.job.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>

                    {/* Question Text */}
                    <h4 className="font-display text-xl font-semibold text-text-primary mb-4">
                      {question.questionText}
                    </h4>

                    {/* Options */}
                    <div className="grid md:grid-cols-2 gap-3 mb-4">
                      {question.options.map((option, optIdx) => {
                        const isCorrect = option === question.correctAnswer;
                        return (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-xl border-2 ${
                              isCorrect
                                ? "border-semantic-success bg-semantic-success/5"
                                : "border-text-primary/10 bg-surface"
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-display font-bold ${
                                  isCorrect
                                    ? "bg-semantic-success text-white"
                                    : "bg-text-muted/20 text-text-muted"
                                }`}
                              >
                                {String.fromCharCode(65 + optIdx)}
                              </div>
                              <span className="text-text-primary">{option}</span>
                              {isCorrect && <Check className="h-4 w-4 text-semantic-success ml-auto" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {question.explanation && (
                      <div className="bg-accent-2/5 rounded-xl p-4 mb-4">
                        <div className="flex items-start space-x-2">
                          <AlertCircle className="h-5 w-5 text-accent-2 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="font-display font-semibold text-accent-2 mb-1">
                              Explanation
                            </div>
                            <p className="text-text-secondary text-sm leading-relaxed">
                              {question.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {statusFilter === "pending_review" && (
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleReview(question.id, "approve")}
                          disabled={processing === question.id}
                          className="btn-primary flex-1 flex items-center justify-center space-x-2"
                        >
                          <ThumbsUp className="h-5 w-5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleReview(question.id, "reject")}
                          disabled={processing === question.id}
                          className="btn-secondary flex-1 flex items-center justify-center space-x-2"
                        >
                          <ThumbsDown className="h-5 w-5" />
                          <span>Reject</span>
                        </button>
                        <button
                          onClick={() => handleReview(question.id, "needs_revision")}
                          disabled={processing === question.id}
                          className="px-6 py-3 bg-semantic-warning/10 text-semantic-warning border-2 border-semantic-warning rounded-xl font-display font-semibold hover:bg-semantic-warning/20 transition-all flex items-center space-x-2"
                        >
                          <AlertCircle className="h-5 w-5" />
                          <span>Needs Revision</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
}
