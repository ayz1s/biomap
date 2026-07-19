// Жёсткий откат: полностью удаляет урок BIO5_L005 и всё его содержимое
// (карточки, схемы, вопросы, варианты, прогресс/ошибки/повторения пользователей
// по этому уроку). Ничего другого не трогает. Мягкий откат — просто вернуть
// Lesson.published в false скриптом toggle-bio5-l005.ts, без удаления данных.
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const LESSON_ID = "BIO5_L005";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const existing = await prisma.lesson.findUnique({ where: { id: LESSON_ID } });
  if (!existing) {
    console.log(`${LESSON_ID}: не найден, удалять нечего.`);
    return;
  }

  await prisma.$transaction(async (tx) => {
    const questions = await tx.question.findMany({
      where: { lessonId: LESSON_ID },
      select: { id: true },
    });
    const questionIds = questions.map((q) => q.id);
    await tx.userMistake.deleteMany({ where: { questionId: { in: questionIds } } });
    await tx.hint.deleteMany({ where: { questionId: { in: questionIds } } });
    await tx.questionOption.deleteMany({ where: { questionId: { in: questionIds } } });
    await tx.question.deleteMany({ where: { lessonId: LESSON_ID } });
    await tx.userLessonProgress.deleteMany({ where: { lessonId: LESSON_ID } });
    await tx.repetitionItem.deleteMany({ where: { lessonId: LESSON_ID } });
    await tx.lessonCard.deleteMany({ where: { lessonId: LESSON_ID } });
    await tx.lesson.delete({ where: { id: LESSON_ID } });
  });

  console.log(`${LESSON_ID}: полностью удалён.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
