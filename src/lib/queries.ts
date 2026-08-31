import { prisma } from "@/lib/prisma";
import { nextDueDate, nextInterval } from "@/lib/spaced-repetition";
import type { Language } from "@prisma/client";

async function getCompletedLessonIds(userId: string | null) {
  if (!userId) return new Set<string>();
  const rows = await prisma.userLessonProgress.findMany({
    where: { userId, completed: true },
    select: { lessonId: true },
  });
  return new Set(rows.map((p) => p.lessonId));
}

// Вкладка "По темам" — лендинг: список предметных разделов со сквозным
// прогрессом по всем классам сразу.
export async function getCategoriesWithProgress(userId: string | null, language: Language) {
  const categories = await prisma.topicCategory.findMany({
    where: { language },
    orderBy: { order: "asc" },
    include: {
      topics: {
        include: { lessons: { where: { published: true }, select: { id: true } } },
      },
    },
  });

  const completedLessonIds = await getCompletedLessonIds(userId);

  return categories.map((category) => {
    const lessons = category.topics.flatMap((t) => t.lessons);
    const total = lessons.length;
    const completed = lessons.filter((l) => completedLessonIds.has(l.id)).length;

    return {
      id: category.id,
      name: category.name,
      icon: category.icon,
      colorKey: category.colorKey,
      topicCount: category.topics.length,
      progress: total === 0 ? 0 : Math.round((completed / total) * 100),
      hasLessons: total > 0,
    };
  });
}

// Раздел вкладки "По темам" — темы категории из всех классов, сгруппированные по классу.
export async function getCategoryDetail(categoryId: string, userId: string | null) {
  const category = await prisma.topicCategory.findUnique({
    where: { id: categoryId },
    include: {
      topics: {
        orderBy: [{ gradeId: "asc" }, { order: "asc" }],
        include: {
          grade: true,
          lessons: { where: { published: true }, select: { id: true } },
        },
      },
    },
  });
  if (!category) return null;

  const completedLessonIds = await getCompletedLessonIds(userId);
  const categoryTopics = category.topics;

  const byGrade = new Map<number, { gradeNumber: number; topics: ReturnType<typeof toTopicSummary>[] }>();
  function toTopicSummary(topic: (typeof categoryTopics)[number]) {
    const completed = topic.lessons.filter((l) => completedLessonIds.has(l.id)).length;
    return {
      id: topic.id,
      title: topic.title,
      chapterTitle: topic.chapterTitle,
      hasLessons: topic.lessons.length > 0,
      lessonsCompleted: completed,
      lessonsTotal: topic.lessons.length,
    };
  }

  for (const topic of category.topics) {
    const gradeNumber = topic.grade.number;
    const bucket = byGrade.get(gradeNumber) ?? { gradeNumber, topics: [] };
    bucket.topics.push(toTopicSummary(topic));
    byGrade.set(gradeNumber, bucket);
  }

  return {
    id: category.id,
    name: category.name,
    icon: category.icon,
    grades: Array.from(byGrade.values()).sort((a, b) => a.gradeNumber - b.gradeNumber),
  };
}

// Вкладка "По классам" — главы и темы одного класса, в порядке учебника.
export async function getGradeCurriculum(gradeNumber: number, userId: string | null, language: Language) {
  const grade = await prisma.grade.findUnique({
    where: { number_language: { number: gradeNumber, language } },
    include: {
      topics: {
        orderBy: { order: "asc" },
        include: { lessons: { where: { published: true }, select: { id: true } } },
      },
    },
  });
  if (!grade) return null;

  const completedLessonIds = await getCompletedLessonIds(userId);
  const gradeTopics = grade.topics;

  const byChapter = new Map<
    number,
    { chapterOrder: number; chapterTitle: string; topics: ReturnType<typeof toTopicSummary>[] }
  >();
  function toTopicSummary(topic: (typeof gradeTopics)[number]) {
    const completed = topic.lessons.filter((l) => completedLessonIds.has(l.id)).length;
    return {
      id: topic.id,
      title: topic.title,
      hasLessons: topic.lessons.length > 0,
      lessonsCompleted: completed,
      lessonsTotal: topic.lessons.length,
    };
  }

  for (const topic of grade.topics) {
    const bucket =
      byChapter.get(topic.chapterOrder) ?? { chapterOrder: topic.chapterOrder, chapterTitle: topic.chapterTitle, topics: [] };
    bucket.topics.push(toTopicSummary(topic));
    byChapter.set(topic.chapterOrder, bucket);
  }

  return {
    gradeNumber: grade.number,
    chapters: Array.from(byChapter.values()).sort((a, b) => a.chapterOrder - b.chapterOrder),
  };
}

// Экран одной темы — контекст (класс/глава/раздел), список уроков (не только
// первый — темы вроде "§10" могут иметь несколько уроков) и связи с другими темами.
export async function getTopicDetail(topicId: string, userId: string | null) {
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: {
      grade: true,
      category: true,
      lessons: { where: { published: true }, orderBy: { order: "asc" } },
      connectionsFrom: { include: { toTopic: true } },
    },
  });
  if (!topic) return null;

  const completedLessonIds = await getCompletedLessonIds(userId);

  return {
    id: topic.id,
    title: topic.title,
    chapterTitle: topic.chapterTitle,
    gradeNumber: topic.grade.number,
    categoryName: topic.category?.name ?? null,
    lessons: topic.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      completed: completedLessonIds.has(l.id),
    })),
    connections: topic.connectionsFrom.map((c) => ({
      toTopicName: c.toTopic.title,
      description: c.description,
    })),
  };
}

// Поиск по названию темы для вкладки "По темам" (200-300+ тем — нужен поиск).
export async function searchTopics(query: string, language: Language) {
  const q = query.trim();
  if (q.length < 2) return [];

  const topics = await prisma.topic.findMany({
    where: { title: { contains: q, mode: "insensitive" }, grade: { language } },
    orderBy: [{ gradeId: "asc" }, { order: "asc" }],
    include: { grade: true },
    take: 30,
  });

  return topics.map((t) => ({ id: t.id, title: t.title, gradeNumber: t.grade.number }));
}

// Для каждого сквозного понятия, помеченного в этом уроке, — его вхождения
// в ДРУГИХ (published) уроках: сначала "основное", потом по классу. См.
// docs/cross-grade-links-feature.md. Пустой occurrences — понятие пока нигде
// больше не встречается (фронтенд не должен рисовать ссылку в никуда).
async function getConceptsForLesson(
  lessonId: string,
  conceptOccurrences: { conceptId: string; concept: { title: string; titleUz: string | null } }[],
  language: Language,
) {
  const conceptIds = conceptOccurrences.map((o) => o.conceptId);
  if (conceptIds.length === 0) return [];

  const otherOccurrences = await prisma.conceptOccurrence.findMany({
    where: {
      conceptId: { in: conceptIds },
      lessonId: { not: lessonId },
      lesson: { published: true, topic: { grade: { language } } },
    },
    include: { lesson: { include: { topic: true } } },
  });

  const byConceptId = new Map<string, typeof otherOccurrences>();
  for (const occ of otherOccurrences) {
    const list = byConceptId.get(occ.conceptId) ?? [];
    list.push(occ);
    byConceptId.set(occ.conceptId, list);
  }
  for (const list of byConceptId.values()) {
    list.sort((a, b) => {
      if (a.role !== b.role) return a.role === "PRIMARY" ? -1 : 1;
      return a.gradeNumber - b.gradeNumber;
    });
  }

  return conceptOccurrences.map((occ) => ({
    slug: occ.conceptId,
    title: language === "UZ" ? (occ.concept.titleUz ?? occ.concept.title) : occ.concept.title,
    occurrences: (byConceptId.get(occ.conceptId) ?? []).map((o) => ({
      lessonId: o.lessonId,
      gradeNumber: o.gradeNumber,
      topicTitle: o.lesson.topic.title,
      role: o.role,
      quote: o.quote,
    })),
  }));
}

export async function getLessonWithProgress(lessonId: string, userId: string | null, language: Language) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      cards: {
        include: { steps: { orderBy: { order: "asc" } } },
        orderBy: { order: "asc" },
      },
      questions: {
        orderBy: { order: "asc" },
        include: {
          options: { orderBy: { order: "asc" } },
          hints: { orderBy: { order: "asc" } },
        },
      },
      textChunks: { orderBy: { order: "asc" } },
      topic: { include: { grade: true } },
      conceptOccurrences: { include: { concept: true } },
    },
  });
  if (!lesson || !lesson.published) return null;

  const progress = userId
    ? await prisma.userLessonProgress.findUnique({
        where: { userId_lessonId: { userId, lessonId } },
      })
    : null;

  const concepts = await getConceptsForLesson(lessonId, lesson.conceptOccurrences, language);

  return { lesson, progress, concepts };
}

export async function upsertLessonProgress(
  userId: string,
  lessonId: string,
  data: { currentCardIndex?: number; completed?: boolean },
) {
  return prisma.userLessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: { ...data, completedAt: data.completed ? new Date() : undefined },
    create: {
      userId,
      lessonId,
      currentCardIndex: data.currentCardIndex ?? 0,
      completed: data.completed ?? false,
      completedAt: data.completed ? new Date() : undefined,
    },
  });
}

export async function recordAnswer(userId: string, questionId: string, isCorrect: boolean) {
  if (isCorrect) return;
  await prisma.userMistake.upsert({
    where: { userId_questionId: { userId, questionId } },
    update: { timesWrong: { increment: 1 }, lastWrongAt: new Date() },
    create: { userId, questionId, timesWrong: 1 },
  });
}

export async function completeTestAndScheduleRepetition(userId: string, lessonId: string) {
  const existing = await prisma.repetitionItem.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  });
  const interval = nextInterval(existing?.intervalDays ?? 1, true);
  await prisma.repetitionItem.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: { intervalDays: interval, dueAt: nextDueDate(interval) },
    create: { userId, lessonId, intervalDays: interval, dueAt: nextDueDate(interval) },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const streak = await prisma.userStreak.findUnique({ where: { userId } });
  const lastActive = streak?.lastActiveDate ? new Date(streak.lastActiveDate) : null;
  lastActive?.setHours(0, 0, 0, 0);

  if (!lastActive || lastActive.getTime() !== today.getTime()) {
    const isConsecutiveDay =
      lastActive && today.getTime() - lastActive.getTime() === 24 * 60 * 60 * 1000;
    await prisma.userStreak.upsert({
      where: { userId },
      update: {
        currentStreak: isConsecutiveDay ? { increment: 1 } : 1,
        lastActiveDate: today,
      },
      create: { userId, currentStreak: 1, lastActiveDate: today },
    });
  }
}

export async function getMistakesGroupedByTopic(userId: string) {
  const mistakes = await prisma.userMistake.findMany({
    where: { userId, timesWrong: { gt: 0 } },
    include: {
      question: {
        include: { lesson: { include: { topic: true } } },
      },
    },
  });

  const byTopic = new Map<
    string,
    { topicName: string; wrongCount: number; totalAttempts: number }
  >();

  for (const m of mistakes) {
    const topicName = m.question.lesson.topic.title;
    const entry = byTopic.get(topicName) ?? { topicName, wrongCount: 0, totalAttempts: 0 };
    entry.wrongCount += m.timesWrong;
    entry.totalAttempts += m.timesWrong;
    byTopic.set(topicName, entry);
  }

  return Array.from(byTopic.values());
}

export async function getRepetitionSchedule(userId: string) {
  const items = await prisma.repetitionItem.findMany({
    where: { userId },
    orderBy: { dueAt: "asc" },
    include: { lesson: { include: { topic: true } } },
  });

  const streak = await prisma.userStreak.findUnique({ where: { userId } });

  return {
    items: items.map((item) => ({
      lessonId: item.lessonId,
      lessonTitle: item.lesson.title,
      topicName: item.lesson.topic.title,
      dueAt: item.dueAt,
    })),
    currentStreak: streak?.currentStreak ?? 0,
  };
}

export async function getHomeSummary(userId: string | null, language: Language) {
  const inProgress = userId
    ? await prisma.userLessonProgress.findFirst({
        where: {
          userId,
          completed: false,
          lesson: { published: true, topic: { grade: { language } } },
        },
        orderBy: { updatedAt: "desc" },
        include: { lesson: { include: { cards: true } } },
      })
    : null;

  const fallbackLesson = inProgress
    ? null
    : await prisma.lesson.findFirst({
        where: { published: true, topic: { grade: { language } } },
        orderBy: { order: "asc" },
        include: { cards: true },
      });

  // anchorCardId != null — схема привязана к другой карточке (иконка+оверлей,
  // см. LessonCard.anchorCardId) и не занимает отдельный экран в "N из M".
  const continueLesson = inProgress
    ? {
        lessonId: inProgress.lesson.id,
        title: inProgress.lesson.title,
        currentCardIndex: inProgress.currentCardIndex,
        totalCards: inProgress.lesson.cards.filter((c) => !c.anchorCardId).length,
      }
    : fallbackLesson
      ? {
          lessonId: fallbackLesson.id,
          title: fallbackLesson.title,
          currentCardIndex: 0,
          totalCards: fallbackLesson.cards.filter((c) => !c.anchorCardId).length,
        }
      : null;

  const mistakesCount = userId
    ? await prisma.userMistake.count({ where: { userId, timesWrong: { gt: 0 } } })
    : 0;

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const dueTodayCount = userId
    ? await prisma.repetitionItem.count({ where: { userId, dueAt: { lte: today } } })
    : 0;

  const totalLessons = await prisma.lesson.count({
    where: { published: true, topic: { grade: { language } } },
  });
  const completedLessons = userId
    ? await prisma.userLessonProgress.count({
        where: {
          userId,
          completed: true,
          lesson: { published: true, topic: { grade: { language } } },
        },
      })
    : 0;
  const overallProgress =
    totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

  return { continueLesson, mistakesCount, dueTodayCount, overallProgress };
}
