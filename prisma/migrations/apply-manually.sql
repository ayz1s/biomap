-- Ручное применение 2 накопившихся миграций Prisma к реальной базе (Supabase).
-- Нужно только потому, что у меня (агента) нет сетевого доступа к твоей БД из
-- песочницы — сгенерировать сам Prisma Client я уже смог (см. переписку), а вот
-- выполнить SQL на живой базе не могу. Открой Supabase → SQL Editor → вставь
-- целиком этот файл → Run. Один раз, безопасно (ничего не удаляет, только
-- добавляет колонку/таблицы) и идемпотентно неважно от прежнего состояния —
-- если что-то из этого уже применено, просто не запускай повторно.

BEGIN;

-- ===== Миграция 1: 20260725120000_add_card_steps_and_anchor =====
-- Тап-степпер внутри карточки (короткая строка + разворачиваемый контекст из
-- учебника) и привязка схемы к конкретной карточке (иконка+оверлей вместо
-- отдельного экрана). Ничего не удаляет и не трогает существующие карточки —
-- оба новых поля/таблица опциональны, старые уроки продолжают работать как есть.

ALTER TABLE "LessonCard" ADD COLUMN "anchorCardId" TEXT;

CREATE TABLE "LessonCardStep" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "context" TEXT,

    CONSTRAINT "LessonCardStep_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "LessonCard" ADD CONSTRAINT "LessonCard_anchorCardId_fkey" FOREIGN KEY ("anchorCardId") REFERENCES "LessonCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "LessonCardStep" ADD CONSTRAINT "LessonCardStep_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "LessonCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ===== Миграция 2: 20260726090000_add_lesson_text_chunks =====
-- Вкладка "Текст": кусок исходного текста параграфа учебника с подсветкой
-- (html содержит только <mark data-k="t"|"r">), отдельно от карточек урока.

CREATE TABLE "LessonTextChunk" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "heading" TEXT,
    "html" TEXT NOT NULL,

    CONSTRAINT "LessonTextChunk_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "LessonTextChunk" ADD CONSTRAINT "LessonTextChunk_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ===== Бухгалтерия Prisma: отмечаем обе миграции как применённые =====
-- Чтобы если ты (или я в будущей сессии) когда-нибудь запустите настоящий
-- `prisma migrate deploy`/`dev`, Prisma не пыталась накатить их ещё раз.
-- checksum — реальный sha256 файла migration.sql (совпадает 1-в-1 с тем,
-- что посчитал бы сам Prisma).

INSERT INTO "_prisma_migrations"
  (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
VALUES
  (gen_random_uuid()::text, 'a0ac459c6361103660ac8a8b2677a0676fd7ddd5e3e4ada2659834c35ebb3c53', now(), '20260725120000_add_card_steps_and_anchor', NULL, NULL, now(), 1),
  (gen_random_uuid()::text, '4536b9645a0f7c69f6ed13f85a651beb9c4788f062963fe0c1f318e8a5051f27', now(), '20260726090000_add_lesson_text_chunks', NULL, NULL, now(), 1)
ON CONFLICT (id) DO NOTHING;

COMMIT;
