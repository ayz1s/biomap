import { prisma } from "@/lib/prisma";
import { nextDueDate, nextInterval } from "@/lib/spaced-repetition";

export async function getTopicsWithProgress(userId: string | null) {
  const topics = await prisma.crossTopic.findMany({
    orderBy: { order: "asc" },
    include: {
      gradeLinks: {
        orderBy: { order: "asc" },
        include: { grade: true, lessons: { include: { cards: true } } },
      },
    },
  });

  const completedLessonIds = userId
    ? new Set(
        (
          await prisma.userLessonProgress.findMany({
            where: { userId, completed: true },
            select: { lessonId: true },
          })
        ).map((p) => p.lessonId),
      )
    : new Set<string>();

  return topics.map((topic) => {
    const grades = topic.gradeLinks.map((l) => l.grade.number);
    const lessons = topic.gradeLinks.flatMap((l) => l.lessons);
    const total = lessons.length;
    const completed = lessons.filter((l) => completedLessonIds.has(l.id)).length;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

    return {
      id: topic.id,
      name: topic.name,
      icon: topic.icon,
      colorKey: topic.colorKey,
      minGrade: grades.length ? Math.min(...grades) : null,
      maxGrade: grades.length ? Math.max(...grades) : null,
      progress,
      hasLessons: total > 0,
      firstLessonId: lessons[0]?.id ?? null,
    };
  });
}

export async function getTopicDetail(topicId: string, userId: string | null) {
  const topic = await prisma.crossTopic.findUnique({
    where: { id: topicId },
    include: {
      gradeLinks: {
        orderBy: { order: "asc" },
        include: { grade: true, lessons: { orderBy: { order: "asc" } } },
      },
      connectionsFrom: { include: { toTopic: true } },
    },
  });
  if (!topic) return null;

  const completedLessonIds = userId
    ? new Set(
        (
          await prisma.userLessonProgress.findMany({
            where: { userId, completed: true },
            select: { lessonId: true },
          })
        ).map((p) => p.lessonId),
      )
    : new Set<string>();

  return {
    id: topic.id,
    name: topic.name,
    icon: topic.icon,
    timeline: topic.gradeLinks.map((link) => ({
      gradeNumber: link.grade.number,
      status: link.grade.status,
      subtitle: link.subtitle,
      firstLessonId: link.lessons[0]?.id ?? null,
      lessonsCompleted: link.lessons.filter((l) => completedLessonIds.has(l.id)).length,
      lessonsTotal: link.lessons.length,
    })),
    connections: topic.connectionsFrom.map((c) => ({
      toTopicName: c.toTopic.name,
      description: c.description,
    })),
  };
}

export async function getLessonWithProgress(lessonId: string, userId: string | null) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      cards: { orderBy: { order: "asc" } },
      questions: {
        orderBy: { order: "asc" },
        include: {
          options: { orderBy: { order: "asc" } },
          hints: { orderBy: { order: "asc" } },
        },
      },
      topicGradeLink: { include: { crossTopic: true, grade: true } },
    },
  });
  if (!lesson) return null;

  const progress = userId
    ? await prisma.userLessonProgress.findUnique({
        where: { userId_lessonId: { userId, lessonId } },
      })
    : null;

  return { lesson, progress };
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
        include: { lesson: { include: { topicGradeLink: { include: { crossTopic: true } } } } },
      },
    },
  });

  const byTopic = new Map<
    string,
    { topicName: string; wrongCount: number; totalAttempts: number }
  >();

  for (const m of mistakes) {
    const topicName = m.question.lesson.topicGradeLink.crossTopic.name;
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
    include: { lesson: { include: { topicGradeLink: { include: { crossTopic: true } } } } },
  });

  const streak = await prisma.userStreak.findUnique({ where: { userId } });

  return {
    items: items.map((item) => ({
      lessonId: item.lessonId,
      lessonTitle: item.lesson.title,
      topicName: item.lesson.topicGradeLink.crossTopic.name,
      dueAt: item.dueAt,
    })),
    currentStreak: streak?.currentStreak ?? 0,
  };
}

export async function getHomeSummary(userId: string | null) {
  const inProgress = userId
    ? await prisma.userLessonProgress.findFirst({
        where: { userId, completed: false },
        orderBy: { updatedAt: "desc" },
        include: { lesson: { include: { cards: true } } },
      })
    : null;

  const fallbackLesson = inProgress
    ? null
    : await prisma.lesson.findFirst({
        orderBy: { order: "asc" },
        include: { cards: true },
      });

  const continueLesson = inProgress
    ? {
        lessonId: inProgress.lesson.id,
        title: inProgress.lesson.title,
        currentCardIndex: inProgress.currentCardIndex,
        totalCards: inProgress.lesson.cards.length,
      }
    : fallbackLesson
      ? {
          lessonId: fallbackLesson.id,
          title: fallbackLesson.title,
          currentCardIndex: 0,
          totalCards: fallbackLesson.cards.length,
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

  const totalLessons = await prisma.lesson.count();
  const completedLessons = userId
    ? await prisma.userLessonProgress.count({ where: { userId, completed: true } })
    : 0;
  const overallProgress =
    totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

  return { continueLesson, mistakesCount, dueTodayCount, overallProgress };
}
