import type { Language } from "@prisma/client";

export const LANGUAGES: { code: Language; label: string }[] = [
  { code: "RU", label: "Русский" },
  { code: "UZ", label: "Oʻzbekcha" },
];

const LANGUAGE_CODES = new Set(LANGUAGES.map((l) => l.code));

export function isLanguageCode(value: string): value is Language {
  return LANGUAGE_CODES.has(value as Language);
}
