// Generic смоук-проверка одного урока по его ID и данным из data/bio5_lXXX.json:
//   npx tsx prisma/verify-lesson.ts BIO5_L007
import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { verifyLesson, type LessonJson } from "./lib/generic-lesson-import";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const lessonId = process.argv[2];
  if (!lessonId) throw new Error("Укажи Lesson_ID: npx tsx prisma/verify-lesson.ts BIO5_L007");

  const dataPath = path.join(__dirname, "..", "data", `${lessonId.toLowerCase()}.json`);
  const data = JSON.parse(fs.readFileSync(dataPath, "utf-8")) as LessonJson;

  const { ok, failures } = await verifyLesson(prisma, lessonId, {
    cards: data.cards.length,
    schemes: data.schemes.length,
    questions: data.questions.length,
    published: true,
  });

  if (!ok) {
    console.error(`FAIL (${failures.length}) для ${lessonId}:`);
    for (const f of failures) console.error(" -", f);
    process.exitCode = 1;
  } else {
    console.log(`OK: все проверки ${lessonId} пройдены.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
