// Точечная синхронизация textChunks + Понятия (ConceptOccurrence) уже
// импортированного урока — БЕЗ пересоздания Lesson/LessonCard/Question.
// В отличие от import-all-lessons.ts (который удаляет и пересоздаёт весь
// урок, стирая UserLessonProgress/UserMistake/RepetitionItem), этот скрипт
// трогает только LessonTextChunk и ConceptOccurrence — на них ничьи
// пользовательские данные не ссылаются (см. schema.prisma), так что прогресс
// реальных пользователей остаётся нетронутым.
//
// Использование:
//   npx tsx prisma/sync-lesson-concepts.ts --dry-run [--grade 7]
//   npx tsx prisma/sync-lesson-concepts.ts [--grade 7]
//
// Требует, чтобы урок уже существовал в БД (был импортирован обычным
// import-all-lessons.ts ранее) — если нет, падает с ошибкой на этом файле.
import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { validateLesson, type LessonJson } from "./lib/generic-lesson-import";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function parseGradeNumber(lessonId: string): number {
  const m = lessonId.match(/^BIO(\d+)_/);
  if (!m) throw new Error(`Не удалось определить класс из Lesson_ID "${lessonId}"`);
  return Number(m[1]);
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const gradeFilterIdx = args.indexOf("--grade");
  const gradeFilter = gradeFilterIdx !== -1 ? Number(args[gradeFilterIdx + 1]) : undefined;

  const dataDir = path.join(__dirname, "..", "data");
  const files = fs
    .readdirSync(dataDir)
    .filter((f) => /^bio\d+_l\d+\.json$/.test(f))
    .sort();

  const ok: string[] = [];
  const failed: { file: string; error: string }[] = [];
  const skipped: string[] = [];
  let updated = 0;

  for (const file of files) {
    const raw = JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf-8")) as LessonJson;
    const lessonId = raw.lessonId;

    try {
      const gradeNumber = parseGradeNumber(lessonId);
      if (gradeFilter !== undefined && gradeNumber !== gradeFilter) {
        skipped.push(lessonId);
        continue;
      }

      validateLesson(lessonId, raw);

      const existing = await prisma.lesson.findUnique({ where: { id: lessonId } });
      if (!existing) {
        throw new Error("урока нет в БД — сначала импортируй его обычным import-all-lessons.ts");
      }

      const chunkCount = raw.textChunks?.length ?? 0;
      const conceptCount = raw.Понятия?.length ?? 0;

      if (dryRun) {
        console.log(`[dry-run OK] ${lessonId} -> синхронизировал бы textChunks=${chunkCount}, concepts=${conceptCount}`);
        ok.push(lessonId);
        continue;
      }

      await prisma.$transaction(async (tx) => {
        await tx.lessonTextChunk.deleteMany({ where: { lessonId } });
        await tx.conceptOccurrence.deleteMany({ where: { lessonId } });

        if (chunkCount > 0) {
          await tx.lessonTextChunk.createMany({
            data: (raw.textChunks ?? []).map((t, i) => ({
              lessonId,
              order: i,
              heading: t.Заголовок ?? null,
              html: t.HTML,
            })),
          });
        }

        for (const c of raw.Понятия ?? []) {
          await tx.conceptOccurrence.create({
            data: {
              conceptId: c.Слаг,
              lessonId,
              gradeNumber,
              role: c.Роль === "основное" ? "PRIMARY" : "MENTION",
              quote: c.Цитата,
              pages: c.Страницы,
            },
          });
        }
      });

      updated++;
      ok.push(lessonId);
      console.log(`${lessonId}: синхронизирован — textChunks=${chunkCount}, concepts=${conceptCount} (карточки/вопросы/прогресс не тронуты)`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      failed.push({ file, error: msg });
      console.error(`[FAIL] ${file}: ${msg}`);
    }
  }

  console.log("\n=== Сводка ===");
  console.log(`Обновлено: ${updated}`);
  console.log(`Провалидировано без записи (--dry-run): ${dryRun ? ok.length : 0}`);
  console.log(`Пропущено (фильтр по классу): ${skipped.length}`);
  console.log(`Ошибок: ${failed.length}`);
  if (failed.length > 0) {
    console.log("\nСписок ошибок:");
    for (const f of failed) console.log(` - ${f.file}: ${f.error}`);
    process.exitCode = 1;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
