/**
 * Adaptive Learning Path Service
 * Phase E: Advanced ML-based adaptive learning system
 */

import { generateChatCompletion, isAnyAIConfigured } from "./ai-provider";
import { prisma } from "./prisma";

interface PerformanceData {
  userId: string;
  subjectId?: string;
  recentAttempts: any[];
  averageAccuracy: number;
  averageSpeed: number; // questions per minute
  consistencyScore: number; // 0-1, how consistent is performance
  improvementRate: number; // Rate of improvement over time
}

/**
 * Generate a personalized adaptive learning path for a user
 */
export async function generateAdaptiveLearningPath(params: {
  userId: string;
  subjectId?: string;
  goalType: "exam_prep" | "chapter_mastery" | "skill_improvement";
  targetDate?: Date;
  weeklyHours?: number;
}) {
  if (!isAnyAIConfigured()) {
    throw new Error("No AI provider is configured");
  }

  const { userId, subjectId, goalType, targetDate, weeklyHours } = params;

  // Analyze user performance
  const performanceData = await analyzeUserPerformance(userId, subjectId);
  
  // Detect performance patterns
  const patterns = await detectPerformancePatterns(userId, subjectId);
  
  // Get subject chapters
  const chapters = await getChaptersForPath(subjectId);

  const prompt = `As an AI education expert, create a personalized adaptive learning path.

User Performance Analysis:
${JSON.stringify(performanceData, null, 2)}

Performance Patterns:
${JSON.stringify(patterns, null, 2)}

Available Chapters:
${JSON.stringify(chapters, null, 2)}

Goal: ${goalType}
Target Date: ${targetDate?.toISOString() || "flexible"}
Available Hours per Week: ${weeklyHours || "flexible"}

Create an optimal learning path that:
1. Sequences chapters based on prerequisites and difficulty
2. Focuses on weak areas while reinforcing strengths
3. Adapts difficulty based on performance patterns
4. Includes revision nodes for important topics
5. Provides realistic time estimates
6. Unlocks nodes progressively based on mastery

Return ONLY valid JSON in this format:
{
  "title": "Learning path title",
  "description": "Brief description",
  "difficulty": "easy" | "medium" | "hard",
  "estimatedHours": number,
  "nodes": [
    {
      "chapterId": "chapter_id",
      "order": number,
      "nodeType": "prerequisite" | "core" | "advanced" | "revision",
      "estimatedMinutes": number,
      "difficulty": "easy" | "medium" | "hard",
      "description": "Why this chapter at this point",
      "requiredAccuracy": number (percentage),
      "isUnlocked": boolean
    }
  ]
}`;

  const content = await generateChatCompletion({
    prompt,
    systemPrompt: "You are an expert educational path designer. Always return valid JSON only.",
    temperature: 0.7,
    jsonMode: true,
  });

  const pathData = JSON.parse(content);

  // Create learning path in database
  const learningPath = await prisma.learningPath.create({
    data: {
      userId,
      title: pathData.title,
      description: pathData.description,
      subjectId,
      goalType,
      targetDate,
      difficulty: pathData.difficulty,
      estimatedHours: pathData.estimatedHours,
      isAIGenerated: true,
      nodes: {
        create: pathData.nodes.map((node: any) => ({
          chapterId: node.chapterId,
          order: node.order,
          nodeType: node.nodeType,
          estimatedMinutes: node.estimatedMinutes,
          difficulty: node.difficulty,
          description: node.description,
          requiredAccuracy: node.requiredAccuracy,
          isUnlocked: node.isUnlocked,
        })),
      },
    },
    include: {
      nodes: true,
    },
  });

  return learningPath;
}

/**
 * Analyze user's performance across all attempts
 */
async function analyzeUserPerformance(
  userId: string,
  subjectId?: string
): Promise<PerformanceData> {
  const quizAttempts = await prisma.quizAttempt.findMany({
    where: {
      userId,
      status: "COMPLETED",
      ...(subjectId && {
        quiz: {
          subjectId,
        },
      }),
    },
    include: {
      quiz: true,
    },
    orderBy: { completedAt: "desc" },
    take: 50, // Last 50 attempts for analysis
  });

  if (quizAttempts.length === 0) {
    return {
      userId,
      subjectId,
      recentAttempts: [],
      averageAccuracy: 0,
      averageSpeed: 0,
      consistencyScore: 0,
      improvementRate: 0,
    };
  }

  // Calculate metrics
  const accuracies = quizAttempts.map((a) => a.score / a.totalQuestions);
  const averageAccuracy = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;

  // Calculate speed (questions per minute)
  const speeds = quizAttempts
    .filter((a) => a.timeSpent)
    .map((a) => a.totalQuestions / (a.timeSpent! / 60));
  const averageSpeed = speeds.length > 0 
    ? speeds.reduce((a, b) => a + b, 0) / speeds.length 
    : 1;

  // Calculate consistency (inverse of standard deviation)
  const variance =
    accuracies.reduce((acc, val) => acc + Math.pow(val - averageAccuracy, 2), 0) /
    accuracies.length;
  const stdDev = Math.sqrt(variance);
  const consistencyScore = Math.max(0, 1 - stdDev * 2); // Normalize to 0-1

  // Calculate improvement rate (slope of accuracy over time)
  let improvementRate = 0;
  if (quizAttempts.length >= 5) {
    const recentAccuracy = accuracies.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
    const olderAccuracy = accuracies.slice(-5).reduce((a, b) => a + b, 0) / 5;
    improvementRate = recentAccuracy - olderAccuracy;
  }

  return {
    userId,
    subjectId,
    recentAttempts: quizAttempts.slice(0, 10),
    averageAccuracy,
    averageSpeed,
    consistencyScore,
    improvementRate,
  };
}

/**
 * Detect performance patterns using ML techniques
 */
async function detectPerformancePatterns(userId: string, subjectId?: string) {
  const performanceData = await analyzeUserPerformance(userId, subjectId);

  const patterns: Array<{
    type: string;
    metric: string;
    value: number;
    trend: string;
    confidence: number;
  }> = [];

  // Accuracy pattern
  if (performanceData.averageAccuracy >= 0.8) {
    patterns.push({
      type: "strength",
      metric: "accuracy",
      value: performanceData.averageAccuracy,
      trend: performanceData.improvementRate > 0.05 ? "improving" : "stable",
      confidence: 0.8,
    });
  } else if (performanceData.averageAccuracy < 0.6) {
    patterns.push({
      type: "weakness",
      metric: "accuracy",
      value: performanceData.averageAccuracy,
      trend: performanceData.improvementRate < -0.05 ? "declining" : "stable",
      confidence: 0.8,
    });
  }

  // Speed pattern
  if (performanceData.averageSpeed < 0.5) {
    patterns.push({
      type: "weakness",
      metric: "speed",
      value: performanceData.averageSpeed,
      trend: "stable",
      confidence: 0.7,
    });
  }

  // Consistency pattern
  if (performanceData.consistencyScore < 0.5) {
    patterns.push({
      type: "weakness",
      metric: "consistency",
      value: performanceData.consistencyScore,
      trend: "stable",
      confidence: 0.75,
    });
  }

  // Store patterns in database
  for (const pattern of patterns) {
    await prisma.performancePattern.create({
      data: {
        userId,
        patternType: pattern.type,
        subjectId,
        metric: pattern.metric,
        value: pattern.value,
        trend: pattern.trend,
        confidence: pattern.confidence,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Valid for 30 days
      },
    });
  }

  return patterns;
}

/**
 * Get chapters for learning path
 */
async function getChaptersForPath(subjectId?: string) {
  const chapters = await prisma.chapter.findMany({
    where: subjectId ? { subjectId } : {},
    include: {
      subject: true,
    },
    orderBy: { order: "asc" },
  });

  return chapters.map((ch) => ({
    id: ch.id,
    name: ch.name,
    subject: ch.subject.name,
    order: ch.order,
  }));
}

/**
 * Update learning path progress
 */
export async function updateLearningPathProgress(params: {
  pathId: string;
  nodeId: string;
  userId: string;
  status: "not_started" | "in_progress" | "completed" | "skipped";
  score?: number;
  timeSpent?: number;
}) {
  const { pathId, nodeId, userId, status, score, timeSpent } = params;

  // Get node details
  const node = await prisma.learningPathNode.findUnique({
    where: { id: nodeId },
  });

  if (!node) {
    throw new Error("Node not found");
  }

  // Update or create progress
  const progress = await prisma.learningPathProgress.upsert({
    where: {
      pathId_nodeId_userId: {
        pathId,
        nodeId,
        userId,
      },
    },
    update: {
      status,
      ...(score !== undefined && {
        bestScore: score,
      }),
      ...(timeSpent !== undefined && {
        timeSpentMinutes: timeSpent,
      }),
      lastAttemptAt: new Date(),
      ...(status === "completed" && {
        completedAt: new Date(),
      }),
      attemptCount: {
        increment: 1,
      },
    },
    create: {
      pathId,
      nodeId,
      userId,
      chapterId: node.chapterId,
      status,
      bestScore: score,
      timeSpentMinutes: timeSpent || 0,
      attemptCount: 1,
      lastAttemptAt: new Date(),
      ...(status === "completed" && {
        completedAt: new Date(),
      }),
    },
  });

  // If completed with required accuracy, unlock next node
  if (status === "completed" && score && score >= node.requiredAccuracy) {
    await unlockNextNode(pathId, node.order);
  }

  // Update path completion percentage
  await updatePathCompletion(pathId);

  return progress;
}

/**
 * Unlock next node in learning path
 */
async function unlockNextNode(pathId: string, currentOrder: number) {
  const nextNode = await prisma.learningPathNode.findFirst({
    where: {
      pathId,
      order: currentOrder + 1,
    },
  });

  if (nextNode && !nextNode.isUnlocked) {
    await prisma.learningPathNode.update({
      where: { id: nextNode.id },
      data: { isUnlocked: true },
    });
  }
}

/**
 * Update learning path completion percentage
 */
async function updatePathCompletion(pathId: string) {
  const nodes = await prisma.learningPathNode.findMany({
    where: { pathId },
  });

  const completedNodes = nodes.filter((n) => n.isCompleted).length;
  const completionPercent = Math.round((completedNodes / nodes.length) * 100);

  await prisma.learningPath.update({
    where: { id: pathId },
    data: {
      completionPercent,
      status: completionPercent === 100 ? "completed" : "active",
    },
  });
}

/**
 * Get user's active learning paths with progress
 */
export async function getUserLearningPaths(userId: string) {
  const paths = await prisma.learningPath.findMany({
    where: {
      userId,
      status: { in: ["active", "completed"] },
    },
    include: {
      nodes: {
        orderBy: { order: "asc" },
      },
      progress: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return paths;
}

/**
 * Recommend next action in learning path
 */
export async function recommendNextAction(userId: string, pathId: string) {
  const path = await prisma.learningPath.findUnique({
    where: { id: pathId },
    include: {
      nodes: {
        orderBy: { order: "asc" },
      },
      progress: true,
    },
  });

  if (!path) {
    throw new Error("Learning path not found");
  }

  // Find next unlocked, incomplete node
  const nextNode = path.nodes.find(
    (node) => node.isUnlocked && !node.isCompleted
  );

  if (!nextNode) {
    // All nodes completed or no unlocked nodes
    return {
      action: "complete",
      message: "Congratulations! You've completed this learning path.",
    };
  }

  // Get chapter details
  const chapter = await prisma.chapter.findUnique({
    where: { id: nextNode.chapterId },
    include: { subject: true },
  });

  return {
    action: "continue",
    node: nextNode,
    chapter,
    message: `Continue with ${nextNode.nodeType} node: ${chapter?.name}`,
    estimatedTime: nextNode.estimatedMinutes,
  };
}
