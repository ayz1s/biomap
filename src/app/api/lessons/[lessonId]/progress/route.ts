import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { upsertLessonProgress } from "@/lib/queries";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  const { lessonId } = await params;
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as { currentCardIndex?: number; completed?: boolean };
  const progress = await upsertLessonProgress(userId, lessonId, body);
  return NextResponse.json({ progress });
}
