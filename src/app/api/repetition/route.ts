import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { getRepetitionSchedule } from "@/lib/queries";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ items: [], currentStreak: 0 });
  const data = await getRepetitionSchedule(userId);
  return NextResponse.json(data);
}
