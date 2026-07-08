import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { getHomeSummary } from "@/lib/queries";

export async function GET() {
  const userId = await getCurrentUserId();
  const summary = await getHomeSummary(userId);
  return NextResponse.json(summary);
}
