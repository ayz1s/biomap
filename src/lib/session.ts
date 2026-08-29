import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { Language } from "@prisma/client";

export const SESSION_COOKIE = "biomap_uid";

export async function getCurrentUserId(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

// Язык контента (RU/UZ) для текущего пользователя — по умолчанию RU для
// гостей и пользователей без записи в БД (кука есть, но user не найден).
export async function getCurrentUserLanguage(userId: string | null): Promise<Language> {
  if (!userId) return "RU";
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { language: true } });
  return user?.language ?? "RU";
}
