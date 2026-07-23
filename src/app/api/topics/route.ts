import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { getCategoriesWithProgress } from "@/lib/queries";

export async function GET() {
  const userId = await getCurrentUserId();
  const categories = await getCategoriesWithProgress(userId);
  return NextResponse.json({ categories });
}
