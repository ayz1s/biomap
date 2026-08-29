import { NextResponse } from "next/server";
import { getCurrentUserId, getCurrentUserLanguage } from "@/lib/session";
import { getCategoriesWithProgress } from "@/lib/queries";

export async function GET() {
  const userId = await getCurrentUserId();
  const language = await getCurrentUserLanguage(userId);
  const categories = await getCategoriesWithProgress(userId, language);
  return NextResponse.json({ categories });
}
