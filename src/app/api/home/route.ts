import { NextResponse } from "next/server";
import { getCurrentUserId, getCurrentUserLanguage } from "@/lib/session";
import { getHomeSummary } from "@/lib/queries";

export async function GET() {
  const userId = await getCurrentUserId();
  const language = await getCurrentUserLanguage(userId);
  const summary = await getHomeSummary(userId, language);
  return NextResponse.json(summary);
}
