// Часть 2 миграции реструктуризации тем: проставляет Lesson.topicId для всех
// существующих уроков 5 класса, используя то, что Lesson.id === Lesson_ID из
// data/bio5_lXXX.json (см. prisma/lib/generic-lesson-import.ts) и что каждый
// такой JSON содержит "Параграф": "§ N", однозначно указывающий на новый
// Topic(grade=5, order=N). Ничего не удаляет; безопасно перезапускать —
// пропускает уроки, у которых topicId уже проставлен на нужное значение.
import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function paragraphNumber(raw: string): number {
  const m = raw.match(/(\d+)/);
  if (!m) throw new Error(`Не удалось разобрать номер параграфа из "${raw}"`);
  return Number(m[1]);
}

async function main() {
  const dataDir = path.join(__dirname, "..", "data");
  const files = fs.readdirSync(dataDir).filter((f) => /^bio5_l\d+\.json$/.test(f));
  if (files.length === 0) throw new Error("Не найдено ни одного data/bio5_lXXX.json");

  const grade5 = await prisma.grade.findUniqueOrThrow({ where: { number: 5 } });

  let updated = 0;
  let alreadyOk = 0;
  const missing: string[] = [];

  for (const file of files.sort()) {
    const raw = JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf-8"));
    const lessonId: string = raw.lessonId;
    const order = paragraphNumber(raw.lesson["Параграф"]);

    const topic = await prisma.topic.findUnique({
      where: { gradeId_order: { gradeId: grade5.id, order } },
    });
    if (!topic) throw new Error(`${lessonId}: нет Topic(5 класс, order=${order}) — сверь curriculum-grade5.ts`);

    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) {
      missing.push(lessonId);
      continue;
    }

    if (lesson.topicId === topic.id) {
      alreadyOk++;
      continue;
    }

    await prisma.lesson.update({ where: { id: lessonId }, data: { topicId: topic.id } });
    console.log(`${lessonId} -> §${order} "${topic.title}"`);
    updated++;
  }

  console.log(`\nОбновлено: ${updated}, уже было верно: ${alreadyOk}, нет в БД: ${missing.length}`);
  if (missing.length) console.log("Отсутствуют в БД (пропущены):", missing.join(", "));

  const stillNull = await prisma.lesson.count({ where: { topicId: null } });
  console.log(`Уроков без topicId во всей БД: ${stillNull}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
