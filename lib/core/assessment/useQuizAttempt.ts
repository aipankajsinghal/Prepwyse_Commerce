// lib/core/assessment/useQuizAttempt.ts
import { useCallback, useEffect, useState } from "react";
import type { StoredAnswer } from "./quizAttemptService";

export function useQuizAttempt(options: { attemptId: string; totalQuestions: number; initialQuestionIndex?: number; initialTimeRemaining?: number | null; initialAnswers?: StoredAnswer[] }) {
  const { attemptId, totalQuestions, initialQuestionIndex = 0, initialTimeRemaining = null, initialAnswers = [] } = options;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(initialQuestionIndex);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(initialTimeRemaining);
  const [answers, setAnswers] = useState<Record<string, StoredAnswer>>(() => {
    const m: Record<string, StoredAnswer> = {};
    for (const a of initialAnswers) m[a.questionId] = a;
    return m;
  });

  useEffect(() => {
    if (timeRemaining == null || timeRemaining <= 0) return;
    const id = setInterval(() => setTimeRemaining(t => (t == null ? null : Math.max(t - 1, 0))), 1000);
    return () => clearInterval(id);
  }, [timeRemaining]);

  const setAnswer = useCallback((questionId: string, selectedAnswer?: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: { ...(prev[questionId] ?? { questionId }), selectedAnswer, answeredAt: selectedAnswer ? new Date().toISOString() : undefined } }));
  }, []);

  const toggleMarkForReview = useCallback((questionId: string) => {
    setAnswers(prev => {
      const cur = prev[questionId] ?? { questionId } as StoredAnswer;
      return { ...prev, [questionId]: { ...cur, markedForReview: !cur.markedForReview } };
    });
  }, []);

  useEffect(() => {
    const handler = setTimeout(async () => {
      const payload = { currentQuestionIndex, timeRemaining, answers: Object.values(answers) };
      try {
        await fetch(`/api/attempts/${attemptId}/progress`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      } catch (err) {
        console.error("Failed to autosave attempt", err);
      }
    }, 2000);
    return () => clearTimeout(handler);
  }, [attemptId, currentQuestionIndex, timeRemaining, answers]);

  const progressPercent = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  return { currentQuestionIndex, setCurrentQuestionIndex, timeRemaining, setTimeRemaining, answers, setAnswer, toggleMarkForReview, progressPercent };
}