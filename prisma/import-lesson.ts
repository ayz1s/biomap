// Generic scoped-импорт одного урока из data/<lessonId>.json:
//   npx tsx prisma/import-lesson.ts BIO6_L001
//
// Класс определяется из префикса Lesson_ID (BIO<класс>_...).
// Номер темы (Topic.order в рамках класса) берётся из поля "ТемаНомер" в
// data/<lessonId>.json — так его должен проставлять генератор уроков,
// сверяясь с prisma/data/curriculum-gradeN.ts. Для старых уроков 5 класса
// (data/bio5_l0XX.json), где поля "ТемаНомер" ещё нет, используется фолбэк:
// парсинг номера из "Параграф": "§ N" (безопасно только для 5 класса, где
// печатная нумерация "§" 1:1 совпадает с Topic.order — см. curriculum-grade5.ts).
//
// published=true по умолчанию (уроки публикуются сразу же).
import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { importLesson, type LessonJson } from "./lib/generic-lesson-import";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function parseGradeNumber(lessonId: string): number {
  const m = lessonId.match(/^BIO(\d+)_/);
  if (!m) {
    throw new Error(`Не удалось определить класс из Lesson_ID "${lessonId}" (ожидался префикс BIO<класс>_)`);
  }
  return Number(m[1]);
}

function parseTopicOrder(data: LessonJson): number {
  if (typeof data.lesson.ТемаНомер === "number") return data.lesson.ТемаНомер;

  const raw = data.lesson.Параграф;
  if (typeof raw === "string") {
    const m = raw.match(/(\d+)/);
    if (m) return Number(m[1]);
  }

  throw new Error(
    `Не удалось определить номер темы для ${data.lessonId}: заполни числовое поле "ТемаНомер" в data/${data.lessonId.toLowerCase()}.json (см. Topic.order в prisma/data/curriculum-gradeN.ts)`,
  );
}

async function main() {
  const lessonId = process.argv[2];
  if (!lessonId) throw new Error("Укажи Lesson_ID: npx tsx prisma/import-lesson.ts BIO6_L001");

  const dataPath = path.join(__dirname, "..", "data", `${lessonId.toLowerCase()}.json`);
  const data = JSON.parse(fs.readFileSync(dataPath, "utf-8")) as LessonJson;

  const gradeNumber = parseGradeNumber(lessonId);
  const topicOrder = parseTopicOrder(data);

  await importLesson(prisma, lessonId, data, {
    gradeNumber,
    topicOrder,
    published: true,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
