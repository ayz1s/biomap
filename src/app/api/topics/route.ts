import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { getTopicsWithProgress } from "@/lib/queries";

export async function GET() {
  const userId = await getCurrentUserId();
  const topics = await getTopicsWithProgress(userId);
  return NextResponse.json({ topics });
}
