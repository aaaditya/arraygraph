-- AlterEnum: STARTED → IN_PROGRESS
ALTER TYPE "LessonStatus" RENAME VALUE 'STARTED' TO 'IN_PROGRESS';

-- AlterTable User
ALTER TABLE "User" ADD COLUMN "sessionVersion" INTEGER NOT NULL DEFAULT 0;

-- AlterTable LessonProgress
ALTER TABLE "LessonProgress" ADD COLUMN "lastSection" TEXT,
ADD COLUMN "scrollPosition" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "visualizerState" JSONB,
ADD COLUMN "quizState" JSONB,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "LessonProgress_userId_updatedAt_idx" ON "LessonProgress"("userId", "updatedAt");

-- AuthToken
CREATE TYPE "AuthTokenPurpose" AS ENUM ('EMAIL_VERIFY', 'PASSWORD_RESET');

CREATE TABLE "AuthToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "identifier" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "purpose" "AuthTokenPurpose" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuthToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AuthToken_tokenHash_key" ON "AuthToken"("tokenHash");
CREATE INDEX "AuthToken_identifier_purpose_idx" ON "AuthToken"("identifier", "purpose");

ALTER TABLE "AuthToken" ADD CONSTRAINT "AuthToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- QuizAttempt → QuizResult (keep data)
ALTER TABLE "QuizAttempt" RENAME TO "QuizResult";
ALTER TABLE "QuizResult" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Drop old non-unique index name if present and rebuild
DROP INDEX IF EXISTS "QuizAttempt_userId_quizId_idx";
CREATE UNIQUE INDEX "QuizResult_userId_quizId_key" ON "QuizResult"("userId", "quizId");
CREATE INDEX "QuizResult_userId_updatedAt_idx" ON "QuizResult"("userId", "updatedAt");

-- ProblemAttempt
CREATE TABLE "ProblemAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "bestTime" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProblemAttempt_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProblemAttempt_userId_problemId_language_key" ON "ProblemAttempt"("userId", "problemId", "language");
CREATE INDEX "ProblemAttempt_userId_updatedAt_idx" ON "ProblemAttempt"("userId", "updatedAt");
ALTER TABLE "ProblemAttempt" ADD CONSTRAINT "ProblemAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CodeDraft
CREATE TABLE "CodeDraft" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CodeDraft_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CodeDraft_userId_problemId_language_key" ON "CodeDraft"("userId", "problemId", "language");
ALTER TABLE "CodeDraft" ADD CONSTRAINT "CodeDraft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
