// Смоук-проверка состояния БД после импорта BIO5_L005. В проекте нет
// тест-фреймворка (vitest/jest/playwright не подключены) — это обычный
// npm-скрипт, а не часть CI. Падает с ненулевым кодом при любом расхождении.
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const LESSON_ID = "BIO5_L005";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const failures: string[] = [];
function check(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

async function main() {
  const lesson = await prisma.lesson.findUnique({
    where: { id: LESSON_ID },
    include: {
      cards: { orderBy: { order: "asc" } },
      questions: { include: { options: true, hints: true }, orderBy: { order: "asc" } },
    },
  });

  check(!!lesson, `Урок ${LESSON_ID} не найден в БД`);
  if (!lesson) {
    report();
    return;
  }

  check(lesson.published === false, `Ожидался published=false сразу после импорта, получено ${lesson.published}`);
  check(!!lesson.title, "У урока пустой title");

  const theoryCards = lesson.cards.filter((c) => c.type !== "ILLUSTRATION");
  const schemeCards = lesson.cards.filter((c) => c.type === "ILLUSTRATION");
  check(theoryCards.length === 9, `Ожидалось 9 теоретических карточек, получено ${theoryCards.length}`);
  check(schemeCards.length === 4, `Ожидалось 4 схемы, получено ${schemeCards.length}`);
  check(lesson.questions.length === 7, `Ожидалось 7 вопросов, получено ${lesson.questions.length}`);

  const totalObjects = theoryCards.length + schemeCards.length + lesson.questions.length;
  check(totalObjects === 20, `Ожидалось 20 контент-объектов, получено ${totalObjects}`);

  const cardIds = lesson.cards.map((c) => c.id);
  check(new Set(cardIds).size === cardIds.length, "Найдены дублирующиеся ID карточек/схем");

  const questionIds = lesson.questions.map((q) => q.id);
  check(new Set(questionIds).size === questionIds.length, "Найдены дублирующиеся ID вопросов");

  for (const c of lesson.cards) {
    check(!!c.content, `Карточка ${c.id}: пустой content`);
    check(!!c.canonicalId, `Карточка ${c.id}: отсутствует canonicalId (служебная трассировка)`);
    if (c.type === "ILLUSTRATION") {
      check(!!c.caption, `Схема ${c.id}: отсутствует caption`);
    }
  }

  const orders = lesson.cards.map((c) => c.order);
  const sortedOrders = [...orders].sort((a, b) => a - b);
  check(JSON.stringify(orders) === JSON.stringify(sortedOrders), "Карточки/схемы отданы не по возрастанию order");
  check(
    theoryCards.every((c, i) => c.order === i),
    "Порядок теоретических карточек не 0..8 подряд",
  );
  check(
    schemeCards.every((c, i) => c.order === 9 + i),
    "Порядок схем не продолжает нумерацию после карточек (9..12)",
  );

  for (const q of lesson.questions) {
    check(!!q.text, `Вопрос ${q.id}: пустой текст`);
    check(!!q.note, `Вопрос ${q.id}: отсутствует объяснение (note)`);
    check(!!q.canonicalId, `Вопрос ${q.id}: отсутствует canonicalId`);
    check(q.options.length >= 2, `Вопрос ${q.id}: меньше 2 вариантов ответа`);
    const correctCount = q.options.filter((o) => o.isCorrect).length;
    if (q.type === "SINGLE_CHOICE") {
      check(correctCount === 1, `Вопрос ${q.id} (SINGLE_CHOICE): ожидался 1 правильный вариант, получено ${correctCount}`);
    } else {
      check(correctCount >= 2, `Вопрос ${q.id} (MULTIPLE_CHOICE): ожидалось ≥2 правильных варианта, получено ${correctCount}`);
    }
  }

  const foreignCards = await prisma.lessonCard.count({
    where: { lessonId: LESSON_ID, id: { notIn: cardIds } },
  });
  check(foreignCards === 0, "Логическая ошибка проверки чужих карточек");

  report();
}

function report() {
  if (failures.length > 0) {
    console.error(`FAIL (${failures.length}):`);
    for (const f of failures) console.error(" -", f);
    process.exitCode = 1;
  } else {
    console.log("OK: все проверки BIO5_L005 пройдены.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
