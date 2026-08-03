-- Сквозные связи между классами (см. docs/cross-grade-links-feature.md).
-- Concept — закрытый справочник (сеется из prisma/data/concepts.ts).
-- ConceptOccurrence — одно вхождение понятия в один урок; onDelete: Cascade
-- на lessonId, т.к. importLesson() пересоздаёт урок целиком (как LessonTextChunk).
-- Ничего не удаляет, старые уроки без понятий продолжают работать.

-- CreateTable
CREATE TABLE "Concept" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "categorySlug" TEXT,

    CONSTRAINT "Concept_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConceptOccurrence" (
    "id" TEXT NOT NULL,
    "conceptId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "gradeNumber" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "pages" TEXT,

    CONSTRAINT "ConceptOccurrence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConceptOccurrence_conceptId_lessonId_key" ON "ConceptOccurrence"("conceptId", "lessonId");

-- AddForeignKey
ALTER TABLE "ConceptOccurrence" ADD CONSTRAINT "ConceptOccurrence_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "Concept"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConceptOccurrence" ADD CONSTRAINT "ConceptOccurrence_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
