-- CreateTable
CREATE TABLE "PracticePaper" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "examType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL,
    "totalMarks" INTEGER NOT NULL,
    "subjectId" TEXT,
    "questions" JSONB NOT NULL,
    "solutions" JSONB,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PracticePaper_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticePaperAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "paperId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "totalQuestions" INTEGER NOT NULL,
    "totalMarks" INTEGER NOT NULL,
    "obtainedMarks" INTEGER NOT NULL DEFAULT 0,
    "accuracy" DOUBLE PRECISION,
    "timeSpent" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "PracticePaperAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyNote" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "type" TEXT NOT NULL DEFAULT 'official',
    "authorId" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "tags" JSONB,
    "pdfUrl" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoteBookmark" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NoteBookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "resultCount" INTEGER NOT NULL DEFAULT 0,
    "filters" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PracticePaper_examType_year_idx" ON "PracticePaper"("examType", "year");

-- CreateIndex
CREATE INDEX "PracticePaper_createdAt_idx" ON "PracticePaper"("createdAt");

-- CreateIndex
CREATE INDEX "PracticePaperAttempt_userId_completedAt_idx" ON "PracticePaperAttempt"("userId", "completedAt");

-- CreateIndex
CREATE INDEX "PracticePaperAttempt_paperId_idx" ON "PracticePaperAttempt"("paperId");

-- CreateIndex
CREATE INDEX "StudyNote_chapterId_isPublished_idx" ON "StudyNote"("chapterId", "isPublished");

-- CreateIndex
CREATE INDEX "StudyNote_createdAt_idx" ON "StudyNote"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "NoteBookmark_userId_noteId_key" ON "NoteBookmark"("userId", "noteId");

-- CreateIndex
CREATE INDEX "NoteBookmark_userId_idx" ON "NoteBookmark"("userId");

-- CreateIndex
CREATE INDEX "SearchHistory_userId_createdAt_idx" ON "SearchHistory"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "PracticePaperAttempt" ADD CONSTRAINT "PracticePaperAttempt_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "PracticePaper"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteBookmark" ADD CONSTRAINT "NoteBookmark_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "StudyNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
