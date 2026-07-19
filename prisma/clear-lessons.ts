import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Удаляет все уроки и их содержимое (карточки, вопросы, варианты, подсказки,
// прогресс/ошибки/повторения пользователей по этим урокам). Не трогает
// Grade/CrossTopic/TopicGradeLink/TopicConnection и самих User — только
// содержимое уроков, чтобы можно было наполнить структуру заново.
async function main() {
  console.log("Удаление ошибок пользователей...");
  await prisma.userMistake.deleteMany();

  console.log("Удаление подсказок...");
  await prisma.hint.deleteMany();

  console.log("Удаление вариантов ответов...");
  await prisma.questionOption.deleteMany();

  console.log("Удаление вопросов...");
  await prisma.question.deleteMany();

  console.log("Удаление прогресса пользователей...");
  await prisma.userLessonProgress.deleteMany();

  console.log("Удаление элементов повторения...");
  await prisma.repetitionItem.deleteMany();

  console.log("Удаление карточек уроков...");
  await prisma.lessonCard.deleteMany();

  console.log("Удаление уроков...");
  const { count } = await prisma.lesson.deleteMany();

  console.log(`Готово. Удалено уроков: ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
