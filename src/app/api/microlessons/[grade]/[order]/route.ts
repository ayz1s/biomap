import { NextResponse } from "next/server";
import { getMicroLessonDetail } from "@/lib/queries";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ grade: string; order: string }> },
) {
  const { grade, order } = await params;
  const data = await getMicroLessonDetail(Number(grade), Number(order));
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}
