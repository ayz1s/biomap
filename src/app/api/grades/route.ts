import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId, getCurrentUserLanguage } from "@/lib/session";

export async function GET() {
  const language = await getCurrentUserLanguage(await getCurrentUserId());
  const grades = await prisma.grade.findMany({
    where: { language },
    orderBy: { number: "asc" },
  });
  return NextResponse.json({ grades });
}
