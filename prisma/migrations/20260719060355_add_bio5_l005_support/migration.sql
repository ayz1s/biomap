-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('SINGLE_CHOICE', 'MULTIPLE_CHOICE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "LessonCardType" ADD VALUE 'KEY_TERMS';
ALTER TYPE "LessonCardType" ADD VALUE 'SUMMARY';

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "LessonCard" ADD COLUMN     "canonicalId" TEXT,
ADD COLUMN     "caption" TEXT,
ADD COLUMN     "sourcePages" TEXT;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "canonicalId" TEXT,
ADD COLUMN     "sourcePages" TEXT,
ADD COLUMN     "type" "QuestionType" NOT NULL DEFAULT 'SINGLE_CHOICE';
