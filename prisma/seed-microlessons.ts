import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { PrismaClient, type MicroLessonQuestionKind } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const DATA_PATH = path.join(process.cwd(), "data", "microlessons.json");

interface RawQuestion {
  q: string;
  options: string[];
  answer: string;
  note?: string;
}

interface RawMicroLesson {
  grade: number;
  order: number;
  file: string;
  title: string;
  suit: string;
  scheme: string;
  connections: string;
  common_mistake: string;
  mini_question: RawQuestion;
  milliy_question: RawQuestion;
  hints: string[];
}

// Пересоздаёт вопрос (MINI или MILLIY) вместе с его вариантами ответа и подсказками.
// Простая стратегия "удалить старое → создать заново" — безопасна, потому что
// на MicroLessonQuestion/Option/Hint пока ничего больше не ссылается (нет прогресса
// пользователя, привязанного к их id).
async function upsertQuestion(
  microLessonId: string,
  kind: MicroLessonQuestionKind,
  raw: RawQuestion,
  hints: string[],
) {
  const existing = await prisma.microLessonQuestion.findUnique({
    where: { microLessonId_kind: { microLessonId, kind } },
  });

  if (existing) {
    await prisma.microLessonHint.deleteMany({ where: { questionId: existing.id } });
    await prisma.microLessonOption.deleteMany({ where: { questionId: existing.id } });
    await prisma.microLessonQuestion.delete({ where: { id: existing.id } });
  }

  await prisma.microLessonQuestion.create({
    data: {
      microLessonId,
      kind,
      text: raw.q,
      note: raw.note ?? null,
      options: {
        create: raw.options.map((text, index) => ({
          text,
          isCorrect: text === raw.answer,
          order: index,
        })),
      },
      hints: {
        create: hints.map((text, index) => ({ level: index + 1, text })),
      },
    },
  });
}

async function main() {
  if (!fs.existsSync(DATA_PATH)) {
    throw new Error(`Файл не найден: ${DATA_PATH}`);
  }

  const raw = fs.readFileSync(DATA_PATH, "utf8");
  const items: RawMicroLesson[] = JSON.parse(raw);

  console.log(`Найдено ${items.length} микро-уроков в ${DATA_PATH}`);
  console.log("Начинаю импорт...\n");

  let created = 0;
  let updated = 0;
  const errors: { grade: number; order: number; message: string }[] = [];

  for (const item of items) {
    try {
      const existing = await prisma.microLesson.findUnique({
        where: { grade_order: { grade: item.grade, order: item.order } },
      });

      const microLesson = await prisma.microLesson.upsert({
        where: { grade_order: { grade: item.grade, order: item.order } },
        create: {
          grade: item.grade,
          order: item.order,
          file: item.file,
          title: item.title,
          suit: item.suit,
          scheme: item.scheme,
          connections: item.connections,
          commonMistake: item.common_mistake,
        },
        update: {
          file: item.file,
          title: item.title,
          suit: item.suit,
          scheme: item.scheme,
          connections: item.connections,
          commonMistake: item.common_mistake,
        },
      });

      await upsertQuestion(microLesson.id, "MINI", item.mini_question, []);
      await upsertQuestion(microLesson.id, "MILLIY", item.milliy_question, item.hints);

      if (existing) {
        updated++;
      } else {
        created++;
      }
    } catch (err) {
      errors.push({
        grade: item.grade,
        order: item.order,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  console.log("─".repeat(50));
  console.log("Импорт завершён.");
  console.log(`  Создано новых микро-уроков:   ${created}`);
  console.log(`  Обновлено существующих:      ${updated}`);
  console.log(`  Всего в файле:                ${items.length}`);
  console.log(`  Ошибок:                       ${errors.length}`);

  if (errors.length > 0) {
    console.log("\nСписок ошибок:");
    for (const e of errors) {
      console.log(`  grade=${e.grade} order=${e.order}: ${e.message}`);
    }
  }
}

main()
  .catch((e) => {
    console.error("Критическая ошибка импорта:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
