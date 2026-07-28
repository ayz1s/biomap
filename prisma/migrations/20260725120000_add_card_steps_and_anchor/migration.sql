-- Тап-степпер внутри карточки (короткая строка + разворачиваемый контекст из
-- учебника) и привязка схемы к конкретной карточке (иконка+оверлей вместо
-- отдельного экрана). Ничего не удаляет и не трогает существующие карточки —
-- оба новых поля/таблица опциональны, старые уроки продолжают работать как есть.

-- AlterTable
ALTER TABLE "LessonCard" ADD COLUMN "anchorCardId" TEXT;

-- CreateTable
CREATE TABLE "LessonCardStep" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "context" TEXT,

    CONSTRAINT "LessonCardStep_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
-- Обычный (не deferred) constraint: importLesson() сперва создаёт все
-- карточки/схемы с anchorCardId=NULL, и только вторым проходом (UPDATE)
-- проставляет ссылку — так самоссылка внутри одной транзакции никогда не
-- нарушает порядок вставки, без экзотики вроде DEFERRABLE.
ALTER TABLE "LessonCard" ADD CONSTRAINT "LessonCard_anchorCardId_fkey" FOREIGN KEY ("anchorCardId") REFERENCES "LessonCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonCardStep" ADD CONSTRAINT "LessonCardStep_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "LessonCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
