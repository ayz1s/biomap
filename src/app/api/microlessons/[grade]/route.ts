import { NextResponse } from "next/server";
import { getMicroLessonsByGrade } from "@/lib/queries";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ grade: string }> },
) {
  const { grade } = await params;
  const lessons = await getMicroLessonsByGrade(Number(grade));
  return NextResponse.json({ lessons });
}
