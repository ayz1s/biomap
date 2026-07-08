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

  // Не отдаём isCorrect клиенту — ответ проверяется только на сервере (/answer)
  const questions = data.lesson.questions.map((q) => ({
    ...q,
    options: q.options.map(({ id, text, order }) => ({ id, text, order })),
  }));

  return NextResponse.json({
    lesson: { ...data.lesson, questions },
    progress: data.progress,
  });
}
