import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { getGradeCurriculum } from "@/lib/queries";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ gradeNumber: string }> },
) {
  const { gradeNumber } = await params;
  const userId = await getCurrentUserId();
  const curriculum = await getGradeCurriculum(Number(gradeNumber), userId);
  if (!curriculum) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(curriculum);
}
