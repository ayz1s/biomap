import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUserId, LANGUAGE_COOKIE } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { language } = (await req.json()) as { language?: string };
  if (language !== "RU" && language !== "UZ") {
    return NextResponse.json({ error: "Invalid language" }, { status: 400 });
  }

  const user = await prisma.user.update({ where: { id: userId }, data: { language } });
  // Кука кэширует язык для getCurrentUserLanguage — без этого следующий
  // запрос ещё секунду-другую читал бы старое значение из куки.
  const store = await cookies();
  store.set(LANGUAGE_COOKIE, user.language, { maxAge: 60 * 60 * 24 * 365, path: "/" });
  return NextResponse.json({ language: user.language });
}
