// Массовый импорт всех уроков из data/*.json одним запуском.
//   npx tsx prisma/import-all-lessons.ts            — импортировать все
//   npx tsx prisma/import-all-lessons.ts --grade 6   — только один класс
//   npx tsx prisma/import-all-lessons.ts --dry-run   — только провалидировать
//     (validateLesson + определение класса/темы), в БД ничего не писать
//
// Идемпотентно: importLesson() сам удаляет и пересоздаёт урок, если он уже
// существует, так что повторный запуск на уже импортированных файлах безопасен.
// Файлы обрабатываются по одному (не в одной транзакции на всё), чтобы одна
// сломанная запись не откатывала уже успешно impортированные уроки — вместо
// этого падение логируется и импорт идёт дальше, а в конце печатается сводка.
import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { importLesson, validateLesson, type LessonJson } from "./lib/generic-lesson-import";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function parseGradeNumber(lessonId: string): number {
  const m = lessonId.match(/^BIO(\d+)_/);
  if (!m) throw new Error(`Не удалось определить класс из Lesson_ID "${lessonId}" (ожидался префикс BIO<класс>_)`);
  return Number(m[1]);
}

function parseTopicOrder(data: LessonJson): number {
  if (typeof data.lesson.ТемаНомер === "number") return data.lesson.ТемаНомер;
  const raw = data.lesson.Параграф;
  if (typeof raw === "string") {
    const m = raw.match(/(\d+)/);
    if (m) return Number(m[1]);
  }
  throw new Error(`Не удалось определить номер темы для ${data.lessonId}: заполни числовое поле "ТемаНомер"`);
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

  if (files.length === 0) throw new Error(`Не найдено ни одного data/bioN_lNNN.json в ${dataDir}`);

  const ok: string[] = [];
  const failed: { file: string; error: string }[] = [];
  const skipped: string[] = [];

  for (const file of files) {
    const raw = JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf-8")) as LessonJson;
    const lessonId = raw.lessonId;

    try {
      const gradeNumber = parseGradeNumber(lessonId);
      if (gradeFilter !== undefined && gradeNumber !== gradeFilter) {
        skipped.push(lessonId);
        continue;
      }
      const topicOrder = parseTopicOrder(raw);

      if (dryRun) {
        validateLesson(lessonId, raw);
        console.log(`[dry-run OK] ${lessonId} -> класс ${gradeNumber}, тема №${topicOrder}`);
      } else {
        await importLesson(prisma, lessonId, raw, { gradeNumber, topicOrder, published: true });
      }
      ok.push(lessonId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      failed.push({ file, error: msg });
      console.error(`[FAIL] ${file}: ${msg}`);
    }
  }

  console.log("\n=== Сводка ===");
  console.log(`Успешно: ${ok.length}`);
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
