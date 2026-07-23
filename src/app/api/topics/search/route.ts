import { NextResponse } from "next/server";
import { searchTopics } from "@/lib/queries";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  const results = await searchTopics(q);
  return NextResponse.json({ results });
}
