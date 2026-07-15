import type { PrismaClient } from "@prisma/client";
import klass10 from "../data/klass_10.json";

type Klass10Entry = {
  grade: number;
  order: number;
  title: string;
  suit: string;
  scheme: string | null;
  connections: string;
  common_mistake: string;
  mini_question: { q: string; options: string[]; answer: string };
  milliy_question: { q: string; options: string[]; answer: string; note?: string };
  hints: string[];
};

// §-диапазоны учебника 10 класса -> ключ сквозной темы
const GRADE10_TOPIC_RANGES: { key: string; from: number; to: number }[] = [
  { key: "cell", from: 1, to: 25 },
  { key: "genetics", from: 26, to: 44 },
  { key: "ecology", from: 45, to: 50 },
  { key: "evolution", from: 51, to: 56 },
];

const GRADE10_TOPIC_NAMES: Record<string, string> = {
  cell: "Клетка",
  genetics: "Генетика",
  ecology: "Экология",
  evolution: "Эволюция",
};

function topicKeyForOrder(order: number): string {
  const range = GRADE10_TOPIC_RANGES.find((r) => order >= r.from && order <= r.to);
  if (!range) throw new Error(`Нет темы для параграфа §${order}`);
  return range.key;
}

function questionFromRaw(
  order: number,
  raw: { q: string; options: string[]; answer: string; note?: string },
  hints: string[]
) {
  return {
    order,
    text: raw.q,
    note: raw.note ?? null,
    options: {
      create: raw.options.map((text, i) => ({
        order: i,
        text,
        isCorrect: text === raw.answer,
      })),
    },
    hints: {
      create: hints.map((text, i) => ({ order: i, text })),
    },
  };
}

// Добавляет 56 уроков 10 класса поверх уже существующих Grade/CrossTopic/TopicGradeLink.
// Идемпотентно: перед вставкой удаляет уже импортированные ранее уроки этих 4 тем для 10 класса,
// не трогая ничего другого (пользователей, прогресс, уроки других классов).
export async function importGrade10(prisma: PrismaClient) {
  const grade10 = await prisma.grade.findUniqueOrThrow({ where: { number: 10 } });

  const linkByTopic = new Map<string, { id: string }>();
  for (const range of GRADE10_TOPIC_RANGES) {
    const topicName = GRADE10_TOPIC_NAMES[range.key];
    const link = await prisma.topicGradeLink.findFirstOrThrow({
      where: { gradeId: grade10.id, crossTopic: { name: topicName } },
    });
    linkByTopic.set(range.key, link);
  }

  const linkIds = [...linkByTopic.values()].map((l) => l.id);
  const oldLessons = await prisma.lesson.findMany({
    where: { topicGradeLinkId: { in: linkIds } },
    select: { id: true },
  });
  const oldLessonIds = oldLessons.map((l) => l.id);

  if (oldLessonIds.length > 0) {
    const oldQuestions = await prisma.question.findMany({
      where: { lessonId: { in: oldLessonIds } },
      select: { id: true },
    });
    const oldQuestionIds = oldQuestions.map((q) => q.id);

    // Удаляем в порядке зависимостей: сначала записи о прогрессе/ошибках
    // пользователей по этим конкретным урокам, затем сам контент урока.
    // Другие уроки, темы и пользовательские данные не затрагиваются.
    await prisma.userMistake.deleteMany({ where: { questionId: { in: oldQuestionIds } } });
    await prisma.hint.deleteMany({ where: { questionId: { in: oldQuestionIds } } });
    await prisma.questionOption.deleteMany({ where: { questionId: { in: oldQuestionIds } } });
    await prisma.question.deleteMany({ where: { lessonId: { in: oldLessonIds } } });
    await prisma.userLessonProgress.deleteMany({ where: { lessonId: { in: oldLessonIds } } });
    await prisma.repetitionItem.deleteMany({ where: { lessonId: { in: oldLessonIds } } });
    await prisma.lessonCard.deleteMany({ where: { lessonId: { in: oldLessonIds } } });
    await prisma.lesson.deleteMany({ where: { id: { in: oldLessonIds } } });
  }

  const entries = (klass10 as Klass10Entry[]).slice().sort((a, b) => a.order - b.order);
  const lessonOrderByTopic = new Map<string, number>();

  for (const entry of entries) {
    const topicKey = topicKeyForOrder(entry.order);
    const link = linkByTopic.get(topicKey)!;
    const lessonOrder = lessonOrderByTopic.get(topicKey) ?? 0;
    lessonOrderByTopic.set(topicKey, lessonOrder + 1);

    await prisma.lesson.create({
      data: {
        topicGradeLinkId: link.id,
        title: entry.title,
        order: lessonOrder,
        cards: {
          create: [
            { type: "EXPLANATION", order: 0, content: entry.suit },
            ...(entry.scheme ? [{ type: "ILLUSTRATION" as const, order: 1, content: entry.scheme }] : []),
            { type: "CONNECTION", order: 2, content: entry.connections },
            { type: "COMMON_MISTAKE", order: 3, content: entry.common_mistake },
            { type: "MINI_QUESTION", order: 4, content: entry.mini_question.q },
          ],
        },
        questions: {
          create: [
            questionFromRaw(0, entry.mini_question, entry.hints),
            questionFromRaw(1, entry.milliy_question, []),
          ],
        },
      },
    });
  }

  console.log(`10 класс: импортировано ${entries.length} уроков.`);
}
