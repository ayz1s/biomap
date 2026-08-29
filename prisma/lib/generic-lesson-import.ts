import type { PrismaClient, LessonCardType, QuestionType, Language } from "@prisma/client";
import { CONCEPTS } from "../data/concepts";

export type LessonRow = {
  Lesson_ID: string;
  Порядок: number;
  Название: string;
  Статус: string;
  // Номер темы (Topic.order) в рамках класса — обязателен для новых уроков
  // (классы 6-11). Для старых уроков 5 класса допустим фолбэк на парсинг
  // "Параграф" (см. prisma/import-lesson.ts).
  ТемаНомер?: number;
  Параграф?: string;
};

export type CardRow = {
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
  // Общий порядок показа среди ВСЕХ карточек урока (теория+схемы вперемешку).
  // Если задан хотя бы у одной карточки/схемы урока — обязателен у всех, и
  // используется вместо старого блочного порядка (сначала все теор. карточки,
  // потом все схемы). Нужен, чтобы схема шла сразу после текста, который она
  // иллюстрирует, а не в самом конце урока — так факт и картинка запоминаются
  // вместе, а не с разрывом в десяток карточек.
  ПорядокОбщий?: number;
  // Шаги внутри карточки: тап по карточке листает их один за другим (короткая
  // строка сразу, "Контекст" — по кнопке "из учебника"), прежде чем становится
  // доступно общее "Далее" к следующей карточке. Не задано — обычная плоская
  // карточка (Текст карточки целиком), как раньше.
  Шаги?: { Текст: string; Контекст?: string }[];
};

export type SchemeRow = {
  Scheme_ID: string;
  Lesson_ID: string;
  Порядок: number;
  Название: string;
  "Структура схемы": string;
  "Подписи/оговорки": string;
  Canonical_ID: string;
  Страницы: string;
  Статус: string;
  ПорядокОбщий?: number;
  // Card_ID карточки, к которой привязана эта схема: показывается маленькой
  // иконкой на той карточке (тап — оверлей), а не отдельным экраном в общей
  // последовательности урока. Не задано — старое поведение (отдельный экран).
  ПривязатьККарточке?: string;
};

export type QuestionRow = {
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

// Кусок текста параграфа учебника для вкладки "Текст" — как есть, без
// сокращений, с подсветкой двух видов (см. HTML ниже). Порядок — позиция
// в массиве textChunks, отдельного поля под это не заводим.
export type TextChunkRow = {
  // Подзаголовок куска, если в книге есть свой (напр. "Формы клеток"). Пусто — без подзаголовка.
  Заголовок?: string;
  // Только текст + <mark data-k="t">...</mark> / <mark data-k="r">...</mark>, никаких других тегов.
  HTML: string;
};

// Пометка сквозного понятия (см. docs/cross-grade-links-feature.md), реально
// встречающегося в параграфе этого урока, с дословной цитатой оттуда. Связь
// между классами никто не пишет руками — она вычисляется совпадением Слаг
// у двух уроков; эта запись лишь фиксирует, что понятие есть В ЭТОМ уроке.
export type ConceptRow = {
  Слаг: string;
  Роль: "основное" | "упоминание";
  Цитата: string;
  Страницы?: string;
};

export type LessonJson = {
  lessonId: string;
  lesson: LessonRow;
  cards: CardRow[];
  schemes: SchemeRow[];
  questions: QuestionRow[];
  textChunks?: TextChunkRow[];
  Понятия?: ConceptRow[];
};

// CONTENT_QA_PASSED — старый ручной аудит (5 класс, см. BioMap_Gold_v2 в "файл
// уроков"). AUTO_QA_PASSED — новый конвейер: контент сгенерирован по тексту
// учебника и прошёл только структурную автопроверку (validateLesson), без
// построчной ручной сверки. Оба статуса допущены к импорту — это честная
// пометка происхождения контента, а не понижение планки.
const ALLOWED_STATUS = new Set(["CONTENT_QA_PASSED", "AUTO_QA_PASSED"]);
const ALLOWED_RELEASE_SOURCES = new Set(["READY", "READY_EDITED", "READY/READY_EDITED"]);
const FORBIDDEN_STATUSES = new Set(["EXCLUDED", "BLOCK"]);
const CONCEPT_IDS = new Set(CONCEPTS.map((c) => c.id));

// Снимает теги <mark> и нормализует (схлопнуть пробелы, ё→е, нижний регистр),
// чтобы механически проверить: "Цитата" — дословная подстрока textChunks
// этого же урока. Единственное, что не даёт агентам выдумывать связи.
function normalizeForQuoteMatch(text: string): string {
  return text
    .replace(/<\/?mark[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .replace(/ё/g, "е")
    .replace(/Ё/g, "Е")
    .toLowerCase()
    .trim();
}

function extractConceptSlugsFromHtml(html: string): string[] {
  return [...html.matchAll(/data-c="([a-z0-9-]+)"/g)].map((m) => m[1]);
}

const COMPONENT_TYPE_MAP: Record<string, LessonCardType> = {
  MAIN_IDEA: "MAIN_IDEA",
  EXPLANATION: "EXPLANATION",
  KEY_TERMS: "KEY_TERMS",
  MISCONCEPTION: "COMMON_MISTAKE",
  SUMMARY: "SUMMARY",
  // Карточка "сквозной темы" — где этот же вопрос встречается в других классах.
  CONNECTION: "CONNECTION",
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

export function validateLesson(lessonId: string, data: LessonJson) {
  if (data.lessonId !== lessonId) {
    throw new Error(`Ожидался lessonId=${lessonId}, получено ${data.lessonId}`);
  }
  if (data.lesson.Lesson_ID !== lessonId) {
    throw new Error(`Строка урока ссылается на чужой Lesson_ID: ${data.lesson.Lesson_ID}`);
  }
  assertAllowedStatus(data.lesson.Статус, data.lesson.Lesson_ID);

  const foreignCards = data.cards.filter((c) => c.Lesson_ID !== lessonId);
  const foreignSchemes = data.schemes.filter((s) => s.Lesson_ID !== lessonId);
  const foreignQuestions = data.questions.filter((q) => q.Lesson_ID !== lessonId);
  if (foreignCards.length || foreignSchemes.length || foreignQuestions.length) {
    throw new Error(
      `Найдены строки с чужим Lesson_ID: cards=${foreignCards.length} schemes=${foreignSchemes.length} questions=${foreignQuestions.length}`,
    );
  }

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
    if (!c.Заголовок) {
      throw new Error(`Карточка ${c.Card_ID}: пустой заголовок`);
    }
    if (!c["Текст карточки"] && !c.Шаги) {
      throw new Error(`Карточка ${c.Card_ID}: пустой текст (и нет Шаги)`);
    }
    if (!c.Canonical_ID) {
      throw new Error(`Карточка ${c.Card_ID}: отсутствует Canonical_ID`);
    }
  }

  const cardIdSet = new Set(data.cards.map((c) => c.Card_ID));

  for (const s of data.schemes) {
    assertAllowedStatus(s.Статус, s.Scheme_ID);
    if (!s["Структура схемы"] || !s.Название) {
      throw new Error(`Схема ${s.Scheme_ID}: пустое название или структура`);
    }
    if (!s.Canonical_ID) {
      throw new Error(`Схема ${s.Scheme_ID}: отсутствует Canonical_ID`);
    }
    if (s.ПривязатьККарточке && !cardIdSet.has(s.ПривязатьККарточке)) {
      throw new Error(
        `Схема ${s.Scheme_ID}: ПривязатьККарточке="${s.ПривязатьККарточке}" не найден среди карточек урока`,
      );
    }
  }

  for (const c of data.cards) {
    if (!c.Шаги) continue;
    if (c.Шаги.length < 2) {
      throw new Error(`Карточка ${c.Card_ID}: Шаги заданы, но их меньше 2 — тогда проще обычным текстом`);
    }
    c.Шаги.forEach((step, i) => {
      if (!step.Текст) throw new Error(`Карточка ${c.Card_ID}: шаг №${i + 1} без текста`);
    });
  }

  // ПорядокОбщий — либо у всех карточек+схем урока сразу, либо ни у одной
  // (иначе непонятно, как перемежать заданные и незаданные позиции).
  const withGlobalOrder = [...data.cards, ...data.schemes].filter((x) => typeof x.ПорядокОбщий === "number");
  if (withGlobalOrder.length > 0 && withGlobalOrder.length !== data.cards.length + data.schemes.length) {
    throw new Error(
      `ПорядокОбщий задан только у ${withGlobalOrder.length} из ${data.cards.length + data.schemes.length} карточек/схем — заполни у всех либо ни у одной`,
    );
  }
  if (withGlobalOrder.length > 0) {
    const values = withGlobalOrder.map((x) => x.ПорядокОбщий as number).sort((a, b) => a - b);
    const expected = values.map((_, i) => i);
    if (JSON.stringify(values) !== JSON.stringify(expected)) {
      throw new Error(
        `ПорядокОбщий у карточек/схем должен быть 0..${values.length - 1} без пропусков и повторов, получено: ${values.join(", ")}`,
      );
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
    if (!q.Canonical_ID) {
      throw new Error(`Вопрос ${q.Question_ID}: отсутствует Canonical_ID`);
    }
  }

  const ALLOWED_TAG = /^<\/?mark(?: data-k="[tr]"| data-k="x" data-c="[a-z0-9-]+")?>$/;
  (data.textChunks ?? []).forEach((chunk, i) => {
    if (!chunk.HTML || !chunk.HTML.trim()) {
      throw new Error(`textChunks[${i}]: пустой HTML`);
    }
    const tags = chunk.HTML.match(/<\/?[a-zA-Z][^>]*>/g) ?? [];
    for (const tag of tags) {
      if (!ALLOWED_TAG.test(tag)) {
        throw new Error(
          `textChunks[${i}]: недопустимый тег "${tag}" — разрешены только <mark data-k="t">, <mark data-k="r"> и <mark data-k="x" data-c="слаг">`,
        );
      }
    }
  });

  // Понятия (сквозные связи между классами, см. cross-grade-links-feature.md)
  // — три автопроверки, делающие выдумывание связей невозможным.
  const concepts = data.Понятия ?? [];

  // 1) Слаг в data-c (textChunks) и в Понятия[].Слаг обязан существовать в concepts.ts.
  const slugsInText = new Set(
    (data.textChunks ?? []).flatMap((t) => extractConceptSlugsFromHtml(t.HTML)),
  );
  for (const slug of slugsInText) {
    if (!CONCEPT_IDS.has(slug)) {
      throw new Error(`textChunks: слаг понятия "${slug}" (data-c) не найден в prisma/data/concepts.ts`);
    }
  }
  assertUnique(concepts.map((c) => c.Слаг), "Слаг понятия (Понятия[].Слаг)");
  concepts.forEach((c, i) => {
    if (!CONCEPT_IDS.has(c.Слаг)) {
      throw new Error(`Понятия[${i}]: слаг "${c.Слаг}" не найден в prisma/data/concepts.ts`);
    }
    if (c.Роль !== "основное" && c.Роль !== "упоминание") {
      throw new Error(`Понятия[${i}] (${c.Слаг}): недопустимая роль "${c.Роль}"`);
    }
    if (!c.Цитата || !c.Цитата.trim()) {
      throw new Error(`Понятия[${i}] (${c.Слаг}): пустая цитата`);
    }
  });

  // 2) Цитата обязана быть дословной подстрокой textChunks этого же урока.
  const normalizedChunksText = (data.textChunks ?? [])
    .map((t) => normalizeForQuoteMatch(t.HTML))
    .join(" ");
  concepts.forEach((c, i) => {
    const normalizedQuote = normalizeForQuoteMatch(c.Цитата);
    if (!normalizedChunksText.includes(normalizedQuote)) {
      throw new Error(
        `Понятия[${i}] (${c.Слаг}): цитата не найдена дословно в textChunks этого урока — "${c.Цитата}"`,
      );
    }
  });

  // 3) Не больше 6 понятий на урок и хотя бы одно с ролью "основное".
  if (concepts.length > 6) {
    throw new Error(`Понятия: не больше 6 на урок, получено ${concepts.length}`);
  }
  if (concepts.length > 0 && !concepts.some((c) => c.Роль === "основное")) {
    throw new Error(`Понятия: должно быть хотя бы одно с ролью "основное"`);
  }
}

// Идемпотентный scoped-импорт ровно одного урока поверх уже существующего
// Grade/Topic (новая схема после реструктуризации от 2026-07-23). Не трогает
// никакие другие уроки, темы, классы или пользовательские данные — только
// Lesson.id === lessonId.
export function languageFromLessonId(lessonId: string): Language {
  return lessonId.endsWith("_UZ") ? "UZ" : "RU";
}

export async function importLesson(
  prisma: PrismaClient,
  lessonId: string,
  data: LessonJson,
  opts: { gradeNumber: number; topicOrder: number; published: boolean },
) {
  validateLesson(lessonId, data);

  const language = languageFromLessonId(lessonId);
  const grade = await prisma.grade.findUniqueOrThrow({
    where: { number_language: { number: opts.gradeNumber, language } },
  });
  const topic = await prisma.topic.findUniqueOrThrow({
    where: { gradeId_order: { gradeId: grade.id, order: opts.topicOrder } },
  });

  await prisma.$transaction(async (tx) => {
    const existing = await tx.lesson.findUnique({ where: { id: lessonId } });
    if (existing) {
      const questions = await tx.question.findMany({ where: { lessonId }, select: { id: true } });
      const questionIds = questions.map((q) => q.id);
      await tx.userMistake.deleteMany({ where: { questionId: { in: questionIds } } });
      await tx.hint.deleteMany({ where: { questionId: { in: questionIds } } });
      await tx.questionOption.deleteMany({ where: { questionId: { in: questionIds } } });
      await tx.question.deleteMany({ where: { lessonId } });
      await tx.userLessonProgress.deleteMany({ where: { lessonId } });
      await tx.repetitionItem.deleteMany({ where: { lessonId } });
      await tx.lessonCard.deleteMany({ where: { lessonId } });
      await tx.lesson.delete({ where: { id: lessonId } });
    }

    const hasGlobalOrder = data.cards.some((c) => typeof c.ПорядокОбщий === "number");

    const cardCreates = data.cards.map((c, i) => ({
      id: c.Card_ID,
      type: COMPONENT_TYPE_MAP[c.Component_Type],
      order: hasGlobalOrder ? (c.ПорядокОбщий as number) : i,
      title: c.Заголовок,
      content: c["Текст карточки"],
      canonicalId: c.Canonical_ID,
      sourcePages: c.Страницы,
      // Шаги создаются вложенно вместе с карточкой — порядок шага это просто
      // его позиция в массиве, отдельного поля под это в JSON не заводим.
      steps: c.Шаги
        ? { create: c.Шаги.map((step, stepIndex) => ({ order: stepIndex, text: step.Текст, context: step.Контекст })) }
        : undefined,
    }));

    // anchorCardId НЕ проставляем здесь: схема и карточка-якорь создаются в
    // одном вложенном create, и ссылка на ещё не существующую (в рамках этого
    // же insert) строку упадёт по FK. Проставляем вторым проходом (UPDATE)
    // ниже, когда обе строки уже точно существуют.
    const schemeCreates = data.schemes.map((s, i) => ({
      id: s.Scheme_ID,
      type: "ILLUSTRATION" as LessonCardType,
      order: hasGlobalOrder ? (s.ПорядокОбщий as number) : data.cards.length + i,
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
        id: lessonId,
        topicId: topic.id,
        title: data.lesson.Название,
        order: data.lesson.Порядок,
        published: opts.published,
        cards: { create: [...cardCreates, ...schemeCreates] },
        questions: { create: questionCreates },
        textChunks: {
          create: (data.textChunks ?? []).map((t, i) => ({
            order: i,
            heading: t.Заголовок,
            html: t.HTML,
          })),
        },
        conceptOccurrences: {
          create: (data.Понятия ?? []).map((c) => ({
            conceptId: c.Слаг,
            gradeNumber: opts.gradeNumber,
            role: c.Роль === "основное" ? "PRIMARY" : "MENTION",
            quote: c.Цитата,
            pages: c.Страницы,
          })),
        },
      },
    });

    // Второй проход: теперь, когда все карточки и схемы урока точно созданы,
    // проставляем anchorCardId у привязанных схем.
    for (const s of data.schemes) {
      if (!s.ПривязатьККарточке) continue;
      await tx.lessonCard.update({
        where: { id: s.Scheme_ID },
        data: { anchorCardId: s.ПривязатьККарточке },
      });
    }
  }, { timeout: 20000 });

  console.log(
    `${lessonId}: импортирован (published=${opts.published}) — ${data.cards.length} карточек, ${data.schemes.length} схем, ${data.questions.length} вопросов.`,
  );
}

export async function removeLesson(prisma: PrismaClient, lessonId: string) {
  const existing = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!existing) {
    console.log(`${lessonId}: не найден, удалять нечего.`);
    return;
  }
  await prisma.$transaction(async (tx) => {
    const questions = await tx.question.findMany({ where: { lessonId }, select: { id: true } });
    const questionIds = questions.map((q) => q.id);
    await tx.userMistake.deleteMany({ where: { questionId: { in: questionIds } } });
    await tx.hint.deleteMany({ where: { questionId: { in: questionIds } } });
    await tx.questionOption.deleteMany({ where: { questionId: { in: questionIds } } });
    await tx.question.deleteMany({ where: { lessonId } });
    await tx.userLessonProgress.deleteMany({ where: { lessonId } });
    await tx.repetitionItem.deleteMany({ where: { lessonId } });
    await tx.lessonCard.deleteMany({ where: { lessonId } });
    await tx.lesson.delete({ where: { id: lessonId } });
  });
  console.log(`${lessonId}: полностью удалён.`);
}

export async function verifyLesson(
  prisma: PrismaClient,
  lessonId: string,
  expected: { cards: number; schemes: number; questions: number; published: boolean },
) {
  const failures: string[] = [];
  const check = (cond: boolean, msg: string) => {
    if (!cond) failures.push(msg);
  };

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      cards: { include: { steps: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } },
      questions: { include: { options: true, hints: true }, orderBy: { order: "asc" } },
      textChunks: { orderBy: { order: "asc" } },
    },
  });

  check(!!lesson, `Урок ${lessonId} не найден в БД`);
  if (!lesson) return { ok: false, failures };

  check(lesson.published === expected.published, `Ожидался published=${expected.published}, получено ${lesson.published}`);
  check(!!lesson.title, "У урока пустой title");

  const theoryCards = lesson.cards.filter((c) => c.type !== "ILLUSTRATION");
  const schemeCards = lesson.cards.filter((c) => c.type === "ILLUSTRATION");
  check(theoryCards.length === expected.cards, `Ожидалось ${expected.cards} теоретических карточек, получено ${theoryCards.length}`);
  check(schemeCards.length === expected.schemes, `Ожидалось ${expected.schemes} схем, получено ${schemeCards.length}`);
  check(lesson.questions.length === expected.questions, `Ожидалось ${expected.questions} вопросов, получено ${lesson.questions.length}`);

  const cardIds = lesson.cards.map((c) => c.id);
  check(new Set(cardIds).size === cardIds.length, "Найдены дублирующиеся ID карточек/схем");
  const questionIds = lesson.questions.map((q) => q.id);
  check(new Set(questionIds).size === questionIds.length, "Найдены дублирующиеся ID вопросов");

  const cardIdSet = new Set(lesson.cards.map((c) => c.id));
  for (const c of lesson.cards) {
    check(!!c.content, `Карточка ${c.id}: пустой content`);
    check(!!c.canonicalId, `Карточка ${c.id}: отсутствует canonicalId`);
    if (c.type === "ILLUSTRATION") check(!!c.caption, `Схема ${c.id}: отсутствует caption`);
    if (c.anchorCardId) check(cardIdSet.has(c.anchorCardId), `Схема ${c.id}: anchorCardId ссылается на несуществующую карточку`);
    if (c.steps.length > 0) {
      check(c.steps.length >= 2, `Карточка ${c.id}: шагов меньше 2`);
      check(c.steps.every((s, i) => s.order === i), `Карточка ${c.id}: порядок шагов нарушен`);
      check(c.steps.every((s) => !!s.text), `Карточка ${c.id}: есть шаг без текста`);
    }
  }

  // Порядок может быть либо блочным (сначала теория, потом схемы — старые
  // уроки), либо перемежающимся через ПорядокОбщий (схема сразу после своей
  // теории — новые уроки). Оба варианта — просто перестановка 0..total-1.
  const orders = lesson.cards.map((c) => c.order);
  const sortedOrders = [...orders].sort((a, b) => a - b);
  const expectedOrders = orders.map((_, i) => i);
  check(JSON.stringify(sortedOrders) === JSON.stringify(expectedOrders), "order карточек/схем — не перестановка 0..N-1 без пропусков/повторов");

  const chunkOrders = lesson.textChunks.map((t) => t.order);
  check(
    JSON.stringify([...chunkOrders].sort((a, b) => a - b)) === JSON.stringify(chunkOrders.map((_, i) => i)),
    "order у textChunks — не перестановка 0..N-1 без пропусков/повторов",
  );
  for (const t of lesson.textChunks) {
    check(!!t.html, `textChunk ${t.id}: пустой html`);
  }

  for (const q of lesson.questions) {
    check(!!q.text, `Вопрос ${q.id}: пустой текст`);
    check(!!q.note, `Вопрос ${q.id}: отсутствует объяснение (note)`);
    check(!!q.canonicalId, `Вопрос ${q.id}: отсутствует canonicalId`);
    check(q.options.length >= 2, `Вопрос ${q.id}: меньше 2 вариантов ответа`);
    const correctCount = q.options.filter((o) => o.isCorrect).length;
    if (q.type === "SINGLE_CHOICE") {
      check(correctCount === 1, `Вопрос ${q.id} (SINGLE_CHOICE): ожидался 1 правильный вариант, получено ${correctCount}`);
    } else {
      check(correctCount >= 2, `Вопрос ${q.id} (MULTIPLE_CHOICE): ожидалось >=2 правильных варианта, получено ${correctCount}`);
    }
  }

  return { ok: failures.length === 0, failures };
}
