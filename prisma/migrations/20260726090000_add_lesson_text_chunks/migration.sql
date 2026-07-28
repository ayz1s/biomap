-- Вкладка "Текст": кусок исходного текста параграфа учебника с подсветкой
-- (html содержит только <mark data-k="t"|"r">), отдельно от карточек урока.
-- Ничего не удаляет, старые уроки без текста продолжают работать (пустой список).

-- CreateTable
CREATE TABLE "LessonTextChunk" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "heading" TEXT,
    "html" TEXT NOT NULL,

    CONSTRAINT "LessonTextChunk_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LessonTextChunk" ADD CONSTRAINT "LessonTextChunk_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
