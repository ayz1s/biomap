import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { getLessonWithProgress } from "@/lib/queries";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  const { lessonId } = await params;
  const userId = await getCurrentUserId();
  const data = await getLessonWithProgress(lessonId, userId);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Явно перечисляем поля наружу: canonicalId/sourcePages — служебная трассировка
  // к источнику, ученику не показывается. isCorrect тоже не отдаём — ответ
  // проверяется только на сервере (/answer).
  const cards = data.lesson.cards.map(({ id, type, order, title, content, caption, svgKey }) => ({
    id,
    type,
    order,
    title,
    content,
    caption,
    svgKey,
  }));

  const questions = data.lesson.questions.map((q) => ({
    id: q.id,
    order: q.order,
    type: q.type,
    text: q.text,
    note: q.note,
    options: q.options.map(({ id, text, order }) => ({ id, text, order })),
    hints: q.hints.map(({ order, text }) => ({ order, text })),
  }));

  return NextResponse.json({
    lesson: { id: data.lesson.id, title: data.lesson.title, cards, questions },
    progress: data.progress,
  });
}
