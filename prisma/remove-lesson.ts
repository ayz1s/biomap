// Generic откат: полностью удаляет один урок по ID (карточки, схемы,
// вопросы, варианты, прогресс/ошибки/повторения пользователей по нему).
//   npx tsx prisma/remove-lesson.ts BIO5_L007
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { removeLesson } from "./lib/generic-lesson-import";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const lessonId = process.argv[2];
  if (!lessonId) throw new Error("Укажи Lesson_ID: npx tsx prisma/remove-lesson.ts BIO5_L007");
  await removeLesson(prisma, lessonId);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
