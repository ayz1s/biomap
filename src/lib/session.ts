import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { Language } from "@prisma/client";

export const SESSION_COOKIE = "biomap_uid";
export const LANGUAGE_COOKIE = "biomap_lang";

export async function getCurrentUserId(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

// Язык контента (RU/UZ) для текущего пользователя — по умолчанию RU для
// гостей и пользователей без записи в БД (кука есть, но user не найден).
// Читаем из куки, а не из БД на каждый запрос: почти каждый API-роут звал
// это первым делом перед основным запросом, и лишний последовательный
// round-trip к БД (регион Сингапур) на КАЖДЫЙ вызов ощутимо тормозил весь
// апп. Кука выставляется здесь при первом обращении (когда её ещё нет) и
// в /api/profile/language при смене языка — расхождение с БД не больше
// одного запроса.
export async function getCurrentUserLanguage(userId: string | null): Promise<Language> {
  const store = await cookies();
  const cached = store.get(LANGUAGE_COOKIE)?.value;
  if (cached === "RU" || cached === "UZ") return cached;

  if (!userId) return "RU";
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { language: true } });
  const language = user?.language ?? "RU";
  store.set(LANGUAGE_COOKIE, language, { maxAge: 60 * 60 * 24 * 365, path: "/" });
  return language;
}
