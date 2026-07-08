import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { getMistakesGroupedByTopic } from "@/lib/queries";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ topics: [] });
  const topics = await getMistakesGroupedByTopic(userId);
  return NextResponse.json({ topics });
}
