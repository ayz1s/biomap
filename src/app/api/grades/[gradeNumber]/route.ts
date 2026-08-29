import { NextResponse } from "next/server";
import { getCurrentUserId, getCurrentUserLanguage } from "@/lib/session";
import { getGradeCurriculum } from "@/lib/queries";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ gradeNumber: string }> },
) {
  const { gradeNumber } = await params;
  const userId = await getCurrentUserId();
  const language = await getCurrentUserLanguage(userId);
  const curriculum = await getGradeCurriculum(Number(gradeNumber), userId, language);
  if (!curriculum) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(curriculum);
}
