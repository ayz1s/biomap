import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { completeTestAndScheduleRepetition } from "@/lib/queries";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  const { lessonId } = await params;
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await completeTestAndScheduleRepetition(userId, lessonId);
  return NextResponse.json({ ok: true });
}
