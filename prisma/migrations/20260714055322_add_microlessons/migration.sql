-- CreateEnum
CREATE TYPE "MicroLessonQuestionKind" AS ENUM ('MINI', 'MILLIY');

-- CreateTable
CREATE TABLE "MicroLesson" (
    "id" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "file" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "suit" TEXT NOT NULL,
    "scheme" TEXT NOT NULL,
    "connections" TEXT NOT NULL,
    "commonMistake" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MicroLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MicroLessonQuestion" (
    "id" TEXT NOT NULL,
    "microLessonId" TEXT NOT NULL,
    "kind" "MicroLessonQuestionKind" NOT NULL,
    "text" TEXT NOT NULL,
    "note" TEXT,

    CONSTRAINT "MicroLessonQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MicroLessonOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,

    CONSTRAINT "MicroLessonOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MicroLessonHint" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "MicroLessonHint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MicroLesson_grade_order_key" ON "MicroLesson"("grade", "order");

-- CreateIndex
CREATE UNIQUE INDEX "MicroLessonQuestion_microLessonId_kind_key" ON "MicroLessonQuestion"("microLessonId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "MicroLessonHint_questionId_level_key" ON "MicroLessonHint"("questionId", "level");

-- AddForeignKey
ALTER TABLE "MicroLessonQuestion" ADD CONSTRAINT "MicroLessonQuestion_microLessonId_fkey" FOREIGN KEY ("microLessonId") REFERENCES "MicroLesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MicroLessonOption" ADD CONSTRAINT "MicroLessonOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "MicroLessonQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MicroLessonHint" ADD CONSTRAINT "MicroLessonHint_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "MicroLessonQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
