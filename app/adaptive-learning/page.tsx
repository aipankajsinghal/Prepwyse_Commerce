"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen,
  Check,
  Lock,
  Play,
  TrendingUp,
  Target,
  Clock,
  Award,
  Sparkles,
  ChevronRight,
  Zap,
  Brain,
} from "lucide-react";

interface LearningPathNode {
  id: string;
  chapterId: string;
  order: number;
  nodeType: string;
  estimatedMinutes: number;
  difficulty: string;
  isUnlocked: boolean;
  isCompleted: boolean;
  chapter?: {
    title: string;
  };
  progress?: {
    status: string;
    bestScore: number;
    timeSpentMinutes: number;
  };
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  estimatedHours: number;
  completionPercent: number;
  status: string;
  nodes: LearningPathNode[];
}

interface NextAction {
  action: string;
  node: LearningPathNode;
  chapter: any;
  message: string;
  estimatedTime: number;
}

export default function AdaptiveLearningPage() {
  const router = useRouter();
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [nextAction, setNextAction] = useState<NextAction | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const loadNextAction = useCallback(async (pathId: string) => {
    try {
      const res = await fetch(`/api/adaptive-learning/next-action?pathId=${pathId}`);
      const data = await res.json();
      setNextAction(data.recommendation);
    } catch (error) {
      console.error("Failed to load next action:", error);
    }
  }, []);

  const loadPaths = useCallback(async () => {
    try {
      const res = await fetch("/api/adaptive-learning/paths");
      const data = await res.json();
      setPaths(data.paths || []);
      if (data.paths && data.paths.length > 0) {
        const activePath = data.paths.find((p: LearningPath) => p.status === "active") || data.paths[0];
        setSelectedPath(activePath);
        loadNextAction(activePath.id);
      }
    } catch (error) {
      console.error("Failed to load paths:", error);
    } finally {
      setLoading(false);
    }
  }, [loadNextAction]);

  useEffect(() => {
    loadPaths();
  }, [loadPaths]);

  const generateNewPath = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/adaptive-learning/generate-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalType: "exam_prep",
          weeklyHours: 10,
        }),
      });
      const data = await res.json();
      if (data.learningPath) {
        await loadPaths();
      }
    } catch (error) {
      console.error("Failed to generate path:", error);
      alert("Failed to generate learning path. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const getNodeIcon = (nodeType: string) => {
    switch (nodeType) {
      case "prerequisite":
        return BookOpen;
      case "core":
        return Target;
      case "advanced":
        return Zap;
      case "revision":
        return TrendingUp;
      default:
        return BookOpen;
    }
  };

  const getNodeColor = (nodeType: string) => {
    switch (nodeType) {
      case "prerequisite":
        return "from-accent-2 to-accent-2-dark";
      case "core":
        return "from-accent-1 to-accent-1-dark";
      case "advanced":
        return "from-primary to-primary-dark";
      case "revision":
        return "from-semantic-success to-semantic-success";
      default:
        return "from-accent-1 to-accent-1-dark";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-semantic-success";
      case "medium":
        return "text-semantic-warning";
      case "hard":
        return "text-semantic-error";
      default:
        return "text-text-secondary";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg))] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Brain className="h-12 w-12 text-accent-1" />
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
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 mb-4 px-4 py-2 rounded-full bg-accent-1/10 text-accent-1">
            <Brain className="h-5 w-5" />
            <span className="font-display font-semibold">AI-Powered Learning</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold mb-6 text-text-primary">
            Your Adaptive Learning Path
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto font-body">
            Personalized study journey that adapts to your performance and learning style
          </p>
        </motion.div>

        {paths.length === 0 ? (
          /* No Paths - Generate New */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="edu-card">
              <Sparkles className="h-20 w-20 text-accent-1 mx-auto mb-6 animate-float" />
              <h2 className="font-display text-3xl font-bold mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-text-secondary mb-8">
                Let our AI create a personalized learning path based on your performance and goals.
              </p>
              <button
                onClick={generateNewPath}
                disabled={generating}
                className="btn-primary disabled:opacity-50"
              >
                {generating ? "Generating Path..." : "Generate My Learning Path"}
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Path Overview */}
            {selectedPath && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
              >
                <div className="edu-card bg-gradient-to-br from-accent-1/5 to-accent-2/5">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <h2 className="font-display text-3xl font-bold mb-2">
                        {selectedPath.title}
                      </h2>
                      <p className="text-text-secondary mb-4">
                        {selectedPath.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="inline-flex items-center space-x-2 text-sm">
                          <Clock className="h-4 w-4 text-accent-1" />
                          <span className="text-text-secondary">
                            ~{selectedPath.estimatedHours} hours
                          </span>
                        </div>
                        <div className="inline-flex items-center space-x-2 text-sm">
                          <Target className={`h-4 w-4 ${getDifficultyColor(selectedPath.difficulty)}`} />
                          <span className="text-text-secondary capitalize">
                            {selectedPath.difficulty} level
                          </span>
                        </div>
                        <div className="inline-flex items-center space-x-2 text-sm">
                          <BookOpen className="h-4 w-4 text-accent-2" />
                          <span className="text-text-secondary">
                            {selectedPath.nodes.length} chapters
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-6">
                      <div className="relative w-32 h-32">
                        <svg className="transform -rotate-90 w-32 h-32">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="rgb(var(--accent-1))"
                            strokeWidth="8"
                            fill="none"
                            strokeOpacity="0.1"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="rgb(var(--accent-1))"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 56}`}
                            strokeDashoffset={`${2 * Math.PI * 56 * (1 - selectedPath.completionPercent / 100)}`}
                            className="transition-all duration-1000"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="font-display text-3xl font-bold text-accent-1">
                              {selectedPath.completionPercent}%
                            </div>
                            <div className="text-xs text-text-muted">Complete</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Next Action */}
                  {nextAction && (
                    <div className="bg-white/50 dark:bg-black/20 rounded-xl p-4 border border-accent-1/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-1 to-accent-1-dark flex items-center justify-center text-white">
                            <Play className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="text-sm text-text-muted font-display font-semibold">
                              NEXT UP
                            </div>
                            <div className="font-display font-bold text-text-primary">
                              {nextAction.message}
                            </div>
                            <div className="text-sm text-text-secondary">
                              ~{nextAction.estimatedTime} minutes
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => router.push(`/quiz?chapter=${nextAction.node.chapterId}`)}
                          className="btn-primary"
                        >
                          Start Now
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Learning Path Nodes */}
            {selectedPath && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="font-display text-2xl font-bold mb-6">
                  Your Learning Journey
                </h3>
                <div className="space-y-4">
                  {selectedPath.nodes.map((node, idx) => {
                    const NodeIcon = getNodeIcon(node.nodeType);
                    const nodeColor = getNodeColor(node.nodeType);

                    return (
                      <motion.div
                        key={node.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.05 }}
                        className={`relative ${
                          node.isCompleted
                            ? "opacity-100"
                            : node.isUnlocked
                            ? "opacity-100"
                            : "opacity-50"
                        }`}
                      >
                        <div
                          className={`edu-card ${
                            node.isCompleted
                              ? "border-semantic-success border-2"
                              : node.isUnlocked
                              ? "border-accent-1 border-2"
                              : "border-text-primary/10 border"
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            {/* Node Number */}
                            <div className="flex-shrink-0">
                              <div
                                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${nodeColor} flex items-center justify-center text-white relative`}
                              >
                                {node.isCompleted ? (
                                  <Check className="h-8 w-8" />
                                ) : node.isUnlocked ? (
                                  <NodeIcon className="h-8 w-8" />
                                ) : (
                                  <Lock className="h-8 w-8" />
                                )}
                                <div className="absolute -top-2 -left-2 w-8 h-8 bg-white dark:bg-surface-elevated rounded-full flex items-center justify-center font-display text-sm font-bold border-2 border-current">
                                  {node.order}
                                </div>
                              </div>
                            </div>

                            {/* Node Details */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h4 className="font-display text-xl font-semibold text-text-primary">
                                      {node.chapter?.title || `Chapter ${node.chapterId}`}
                                    </h4>
                                    <span
                                      className={`text-xs font-display font-semibold px-2 py-0.5 rounded-full ${
                                        node.nodeType === "core"
                                          ? "bg-accent-1/10 text-accent-1"
                                          : node.nodeType === "advanced"
                                          ? "bg-primary/10 text-primary"
                                          : "bg-accent-2/10 text-accent-2"
                                      }`}
                                    >
                                      {node.nodeType}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-4 text-sm text-text-secondary">
                                    <div className="flex items-center space-x-1">
                                      <Clock className="h-4 w-4" />
                                      <span>~{node.estimatedMinutes} min</span>
                                    </div>
                                    <div className={`flex items-center space-x-1 capitalize ${getDifficultyColor(node.difficulty)}`}>
                                      <Target className="h-4 w-4" />
                                      <span>{node.difficulty}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Progress or Action */}
                                <div className="flex-shrink-0 ml-4">
                                  {node.isCompleted ? (
                                    <div className="text-right">
                                      <div className="font-display text-2xl font-bold text-semantic-success">
                                        {node.progress?.bestScore || 0}%
                                      </div>
                                      <div className="text-xs text-text-muted">
                                        {node.progress?.timeSpentMinutes || 0} min
                                      </div>
                                    </div>
                                  ) : node.isUnlocked ? (
                                    <button
                                      onClick={() => router.push(`/quiz?chapter=${node.chapterId}`)}
                                      className="btn-secondary py-2 px-4 flex items-center space-x-2"
                                    >
                                      <Play className="h-4 w-4" />
                                      <span>Start</span>
                                    </button>
                                  ) : (
                                    <div className="text-center text-text-muted">
                                      <Lock className="h-6 w-6 mx-auto mb-1" />
                                      <div className="text-xs">Locked</div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Connector Line */}
                        {idx < selectedPath.nodes.length - 1 && (
                          <div className="flex justify-center my-2">
                            <ChevronRight className="h-6 w-6 text-text-muted rotate-90" />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Generate New Path Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 text-center"
            >
              <button
                onClick={generateNewPath}
                disabled={generating}
                className="btn-secondary disabled:opacity-50"
              >
                <Sparkles className="inline h-5 w-5 mr-2" />
                {generating ? "Generating..." : "Generate New Path"}
              </button>
            </motion.div>
          </>
        )}

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16"
        >
          <h2 className="font-display text-3xl font-bold text-center mb-12">
            Why Adaptive Learning Works
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: Brain,
                title: "Personalized Sequence",
                desc: "AI analyzes your performance to create the optimal learning order",
              },
              {
                icon: TrendingUp,
                title: "Progressive Mastery",
                desc: "Unlock new chapters only when you've mastered the prerequisites",
              },
              {
                icon: Award,
                title: "Goal-Oriented",
                desc: "Paths tailored to your specific exam preparation goals",
              },
            ].map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + idx * 0.1 }}
                className="edu-card text-center"
              >
                <benefit.icon className="h-12 w-12 text-accent-1 mx-auto mb-4" />
                <h4 className="font-display text-xl font-semibold mb-2">
                  {benefit.title}
                </h4>
                <p className="text-text-secondary">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
