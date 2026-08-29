import { NextResponse } from "next/server";
import { getCurrentUserId, getCurrentUserLanguage } from "@/lib/session";
import { searchTopics } from "@/lib/queries";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  const language = await getCurrentUserLanguage(await getCurrentUserId());
  const results = await searchTopics(q, language);
  return NextResponse.json({ results });
}
