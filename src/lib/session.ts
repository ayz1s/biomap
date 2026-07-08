import { cookies } from "next/headers";

export const SESSION_COOKIE = "biomap_uid";

export async function getCurrentUserId(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}
