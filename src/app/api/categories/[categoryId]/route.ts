import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { getCategoryDetail } from "@/lib/queries";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  const { categoryId } = await params;
  const userId = await getCurrentUserId();
  const category = await getCategoryDetail(categoryId, userId);
  if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ category });
}
