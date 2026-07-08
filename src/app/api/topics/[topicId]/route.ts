import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { getTopicDetail } from "@/lib/queries";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ topicId: string }> },
) {
  const { topicId } = await params;
  const userId = await getCurrentUserId();
  const topic = await getTopicDetail(topicId, userId);
  if (!topic) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ topic });
}
