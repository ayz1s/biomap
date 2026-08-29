import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { language } = (await req.json()) as { language?: string };
  if (language !== "RU" && language !== "UZ") {
    return NextResponse.json({ error: "Invalid language" }, { status: 400 });
  }

  const user = await prisma.user.update({ where: { id: userId }, data: { language } });
  return NextResponse.json({ language: user.language });
}
