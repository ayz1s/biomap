-- Phase 1 (additive, safe) of the topic-taxonomy restructuring.
-- Adds TopicCategory + Topic tables and a nullable Lesson.topicId column,
-- without touching CrossTopic/TopicGradeLink/Lesson.topicGradeLinkId yet.
-- Those are dropped in a later migration only after data has been backfilled
-- and the deletion has been confirmed (see prisma/backfill-lesson-topics.ts).

-- CreateTable
CREATE TABLE "TopicCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "colorKey" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TopicCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "gradeId" TEXT NOT NULL,
    "categoryId" TEXT,
    "chapterTitle" TEXT NOT NULL,
    "chapterOrder" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Topic_gradeId_order_key" ON "Topic"("gradeId", "order");

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TopicCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable: nullable for now, backfilled by script, made NOT NULL in the follow-up migration
ALTER TABLE "Lesson" ADD COLUMN "topicId" TEXT;

-- AddForeignKey (nullable FK — satisfied automatically while topicId is NULL)
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
