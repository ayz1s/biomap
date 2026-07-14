import { NextResponse } from "next/server";
import { getMicroLessonGrades } from "@/lib/queries";

export async function GET() {
  const grades = await getMicroLessonGrades();
  return NextResponse.json({ grades });
}
