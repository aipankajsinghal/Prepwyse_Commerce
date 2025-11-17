-- prisma/migrations/20251117_add_quizattempt_progress/steps.sql
ALTER TABLE "QuizAttempt" ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'IN_PROGRESS';
ALTER TABLE "QuizAttempt" ADD COLUMN IF NOT EXISTS "currentQuestionIndex" INTEGER DEFAULT 0;
ALTER TABLE "QuizAttempt" ADD COLUMN IF NOT EXISTS "durationSeconds" INTEGER;
ALTER TABLE "QuizAttempt" ADD COLUMN IF NOT EXISTS "timeRemaining" INTEGER;