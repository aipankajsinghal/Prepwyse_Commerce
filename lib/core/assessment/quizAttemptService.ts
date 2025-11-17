// lib/core/assessment/quizAttemptService.ts
import { prisma } from "@/lib/prisma";

export type StoredAnswer = {
  questionId: string;
  selectedAnswer?: string;
  markedForReview?: boolean;
  answeredAt?: string;
};

export const QuizAttemptService = {
  async startAttempt({ userId, quizId }: { userId: string; quizId: string }) {
    const quiz = await prisma.quiz.findUniqueOrThrow({ where: { id: quizId } });
    const totalQuestions = quiz.questionCount ?? 10;
    const durationSeconds = quiz.duration ? quiz.duration * 60 : null;

    const attempt = await prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        totalQuestions,
        durationSeconds: durationSeconds ?? undefined,
        timeRemaining: durationSeconds ?? undefined,
        status: "IN_PROGRESS",
        answers: [],
      },
    });

    return attempt;
  },

  async updateProgress({ userId, attemptId, currentQuestionIndex, timeRemaining, answers }:
    { userId: string; attemptId: string; currentQuestionIndex?: number; timeRemaining?: number | null; answers?: StoredAnswer[]; }) {

    const attempt = await prisma.quizAttempt.findFirstOrThrow({ where: { id: attemptId, userId } });
    if (attempt.status !== "IN_PROGRESS") return attempt;

    const existingAnswers = (attempt.answers as StoredAnswer[]) ?? [];
    const merged = mergeAnswers(existingAnswers, answers ?? []);

    const updated = await prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        currentQuestionIndex: typeof currentQuestionIndex === "number" ? currentQuestionIndex : attempt.currentQuestionIndex,
        timeRemaining: typeof timeRemaining === "number" ? timeRemaining : attempt.timeRemaining,
        answers: merged,
      },
    });

    return updated;
  },

  async submitAttempt({ userId, attemptId }: { userId: string; attemptId: string }) {
    const attempt = await prisma.quizAttempt.findFirstOrThrow({ where: { id: attemptId, userId } });
    if (attempt.status !== "IN_PROGRESS") return attempt;

    const quiz = await prisma.quiz.findUniqueOrThrow({ where: { id: attempt.quizId } });
    const chapterIds = (quiz.chapterIds as string[]) ?? [];

    const questions = await prisma.question.findMany({ where: { chapterId: { in: chapterIds } }, orderBy: { createdAt: "asc" }, take: quiz.questionCount });

    const answers = (attempt.answers as StoredAnswer[]) ?? [];
    let score = 0;
    for (const q of questions) {
      const a = answers.find(x => x.questionId === q.id);
      if (!a?.selectedAnswer) continue;
      if (a.selectedAnswer === q.correctAnswer) score++;
    }

    const timeSpent = attempt.startedAt ? Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000) : undefined;

    const updated = await prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        timeSpent: timeSpent ?? undefined,
        score,
        timeRemaining: 0,
      },
    });

    return updated;
  },
};

function mergeAnswers(existing: StoredAnswer[], incoming: StoredAnswer[]) {
  const map = new Map<string, StoredAnswer>();
  for (const e of existing) map.set(e.questionId, e);
  for (const i of incoming) {
    const cur = map.get(i.questionId) ?? { questionId: i.questionId };
    map.set(i.questionId, {
      ...cur,
      ...i,
      answeredAt: i.selectedAnswer ? (i.answeredAt ?? new Date().toISOString()) : cur.answeredAt,
    });
  }
  return Array.from(map.values());
}