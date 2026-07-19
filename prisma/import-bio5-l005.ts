import type { PrismaClient, LessonCardType, QuestionType } from "@prisma/client";
import bio5L005 from "../data/bio5_l005.json";

const LESSON_ID = "BIO5_L005";

type LessonRow = {
  Lesson_ID: string;
  Порядок: number;
  Название: string;
  Статус: string;
};

type CardRow = {
  Card_ID: string;
  Lesson_ID: string;
  Порядок: number;
  Component_Type: string;
  Заголовок: string;
  "Текст карточки": string;
  Canonical_ID: string;
  Страницы: string;
  "Release source": string;
  Статус: string;
};

type SchemeRow = {
  Scheme_ID: string;
  Lesson_ID: string;
  Порядок: number;
  Название: string;
  "Структура схемы": string;
  "Подписи/оговорки": string;
  Canonical_ID: string;
  Страницы: string;
  Статус: string;
};

type QuestionRow = {
  Question_ID: string;
  Lesson_ID: string;
  Порядок: number;
  Question_Type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE";
  Вопрос: string;
  "Варианты через |": string;
  "Правильный ответ": string;
  Answer_Index: number | string;
  Объяснение: string;
  Canonical_ID: string;
  Страницы: string;
  Статус: string;
};

type Bio5L005Json = {
  lessonId: string;
  lesson: LessonRow;
  cards: CardRow[];
  schemes: SchemeRow[];
  questions: QuestionRow[];
};

const ALLOWED_STATUS = new Set(["CONTENT_QA_PASSED"]);
const ALLOWED_RELEASE_SOURCES = new Set(["READY", "READY_EDITED", "READY/READY_EDITED"]);
const FORBIDDEN_STATUSES = new Set(["EXCLUDED", "BLOCK"]);

const COMPONENT_TYPE_MAP: Record<string, LessonCardType> = {
  MAIN_IDEA: "MAIN_IDEA",
  EXPLANATION: "EXPLANATION",
  KEY_TERMS: "KEY_TERMS",
  MISCONCEPTION: "COMMON_MISTAKE",
  SUMMARY: "SUMMARY",
};

function assertAllowedStatus(status: string, context: string) {
  if (FORBIDDEN_STATUSES.has(status)) {
    throw new Error(`BLOCK_LEAKAGE: запись "${context}" имеет запрещённый статус "${status}"`);
  }
  if (!ALLOWED_STATUS.has(status)) {
    throw new Error(`Неизвестный статус "${status}" у "${context}" — импорт остановлен`);
  }
}

function assertUnique(ids: string[], label: string) {
  const seen = new Set(ids);
  if (seen.size !== ids.length) {
    throw new Error(`Найдены дублирующиеся ${label}: ${ids.join(", ")}`);
  }
}

function validate(data: Bio5L005Json) {
  if (data.lessonId !== LESSON_ID) {
    throw new Error(`Ожидался lessonId=${LESSON_ID}, получено ${data.lessonId}`);
  }
  if (data.lesson.Lesson_ID !== LESSON_ID) {
    throw new Error(`Строка урока ссылается на чужой Lesson_ID: ${data.lesson.Lesson_ID}`);
  }
  assertAllowedStatus(data.lesson.Статус, data.lesson.Lesson_ID);

  const foreignCards = data.cards.filter((c) => c.Lesson_ID !== LESSON_ID);
  const foreignSchemes = data.schemes.filter((s) => s.Lesson_ID !== LESSON_ID);
  const foreignQuestions = data.questions.filter((q) => q.Lesson_ID !== LESSON_ID);
  if (foreignCards.length || foreignSchemes.length || foreignQuestions.length) {
    throw new Error(
      `Найдены строки с чужим Lesson_ID: cards=${foreignCards.length} schemes=${foreignSchemes.length} questions=${foreignQuestions.length}`,
    );
  }

  if (data.cards.length !== 9) throw new Error(`Ожидалось 9 карточек, получено ${data.cards.length}`);
  if (data.schemes.length !== 4) throw new Error(`Ожидалось 4 схемы, получено ${data.schemes.length}`);
  if (data.questions.length !== 7) throw new Error(`Ожидалось 7 вопросов, получено ${data.questions.length}`);
  const total = data.cards.length + data.schemes.length + data.questions.length;
  if (total !== 20) throw new Error(`Ожидалось 20 контент-объектов, получено ${total}`);

  assertUnique(data.cards.map((c) => c.Card_ID), "Card_ID");
  assertUnique(data.schemes.map((s) => s.Scheme_ID), "Scheme_ID");
  assertUnique(data.questions.map((q) => q.Question_ID), "Question_ID");

  for (const c of data.cards) {
    assertAllowedStatus(c.Статус, c.Card_ID);
    if (!ALLOWED_RELEASE_SOURCES.has(c["Release source"])) {
      throw new Error(`Карточка ${c.Card_ID}: недопустимый Release source "${c["Release source"]}"`);
    }
    if (!COMPONENT_TYPE_MAP[c.Component_Type]) {
      throw new Error(`Карточка ${c.Card_ID}: неизвестный Component_Type "${c.Component_Type}"`);
    }
    if (!c["Текст карточки"] || !c.Заголовок) {
      throw new Error(`Карточка ${c.Card_ID}: пустой заголовок или текст`);
    }
  }

  for (const s of data.schemes) {
    assertAllowedStatus(s.Статус, s.Scheme_ID);
    if (!s["Структура схемы"] || !s.Название) {
      throw new Error(`Схема ${s.Scheme_ID}: пустое название или структура`);
    }
  }

  for (const q of data.questions) {
    assertAllowedStatus(q.Статус, q.Question_ID);
    if (!q.Вопрос || !q["Варианты через |"] || !q["Правильный ответ"]) {
      throw new Error(`Вопрос ${q.Question_ID}: не заполнены обязательные поля`);
    }
    const options = q["Варианты через |"].split("|").map((s) => s.trim());
    const correctIndexes = String(q.Answer_Index)
      .split(";")
      .map((s) => Number(s.trim()));
    const correctByIndex = correctIndexes.map((i) => options[i - 1]);
    const correctByText = q["Правильный ответ"].split(";").map((s) => s.trim());
    const a = [...correctByIndex].sort().join("|");
    const b = [...correctByText].sort().join("|");
    if (a !== b) {
      throw new Error(
        `Вопрос ${q.Question_ID}: Answer_Index (${correctByIndex.join(", ")}) не совпадает с "Правильный ответ" (${correctByText.join(", ")})`,
      );
    }
    if (q.Question_Type === "SINGLE_CHOICE" && correctIndexes.length !== 1) {
      throw new Error(`Вопрос ${q.Question_ID}: SINGLE_CHOICE должен иметь ровно один Answer_Index`);
    }
  }
}

// Идемпотентный scoped-импорт ровно одного урока BIO5_L005 поверх уже
// существующего Grade/CrossTopic/TopicGradeLink (Клетка × 5 класс). Не трогает
// никакие другие уроки, темы, классы или пользовательские данные. Всегда
// импортирует с published=false — включение делается отдельно.
export async function importBio5L005(prisma: PrismaClient) {
  const data = bio5L005 as Bio5L005Json;
  validate(data);

  const grade5 = await prisma.grade.findUniqueOrThrow({ where: { number: 5 } });
  const link = await prisma.topicGradeLink.findFirstOrThrow({
    where: { gradeId: grade5.id, crossTopic: { name: "Клетка" } },
  });

  await prisma.$transaction(async (tx) => {
    const existing = await tx.lesson.findUnique({ where: { id: LESSON_ID } });
    if (existing) {
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
    }

    const cardCreates = data.cards.map((c, i) => ({
      id: c.Card_ID,
      type: COMPONENT_TYPE_MAP[c.Component_Type],
      order: i,
      title: c.Заголовок,
      content: c["Текст карточки"],
      canonicalId: c.Canonical_ID,
      sourcePages: c.Страницы,
    }));

    const schemeCreates = data.schemes.map((s, i) => ({
      id: s.Scheme_ID,
      type: "ILLUSTRATION" as LessonCardType,
      order: data.cards.length + i,
      title: s.Название,
      content: s["Структура схемы"],
      caption: s["Подписи/оговорки"],
      canonicalId: s.Canonical_ID,
      sourcePages: s.Страницы,
    }));

    const questionCreates = data.questions.map((q, i) => {
      const options = q["Варианты через |"].split("|").map((s) => s.trim());
      const correctIndexes = new Set(
        String(q.Answer_Index)
          .split(";")
          .map((s) => Number(s.trim())),
      );
      return {
        id: q.Question_ID,
        order: i,
        type: q.Question_Type as QuestionType,
        text: q.Вопрос,
        note: q.Объяснение,
        canonicalId: q.Canonical_ID,
        sourcePages: q.Страницы,
        options: {
          create: options.map((text, idx) => ({
            order: idx,
            text,
            isCorrect: correctIndexes.has(idx + 1),
          })),
        },
      };
    });

    await tx.lesson.create({
      data: {
        id: LESSON_ID,
        topicGradeLinkId: link.id,
        title: data.lesson.Название,
        order: data.lesson.Порядок,
        published: false,
        cards: { create: [...cardCreates, ...schemeCreates] },
        questions: { create: questionCreates },
      },
    });
  });

  console.log(`${LESSON_ID}: импортирован (published=false) — 9 карточек, 4 схемы, 7 вопросов.`);
}
