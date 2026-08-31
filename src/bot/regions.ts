import type { Language, Region } from "@prisma/client";

// Название региона в кнопке зависит от языка пользователя (см. src/bot/strings.ts) —
// список областей Узбекистана переводится точно так же, как остальные тексты бота.
export const REGIONS: { code: Region; label: Record<Language, string> }[] = [
  { code: "ANDIJAN", label: { RU: "Андижанская область", UZ: "Andijon viloyati" } },
  { code: "BUKHARA", label: { RU: "Бухарская область", UZ: "Buxoro viloyati" } },
  { code: "JIZZAKH", label: { RU: "Джизакская область", UZ: "Jizzax viloyati" } },
  { code: "KASHKADARYA", label: { RU: "Кашкадарьинская область", UZ: "Qashqadaryo viloyati" } },
  { code: "NAVOI", label: { RU: "Навоийская область", UZ: "Navoiy viloyati" } },
  { code: "NAMANGAN", label: { RU: "Наманганская область", UZ: "Namangan viloyati" } },
  { code: "SAMARKAND", label: { RU: "Самаркандская область", UZ: "Samarqand viloyati" } },
  { code: "SURKHANDARYA", label: { RU: "Сурхандарьинская область", UZ: "Surxondaryo viloyati" } },
  { code: "SYRDARYA", label: { RU: "Сырдарьинская область", UZ: "Sirdaryo viloyati" } },
  { code: "TASHKENT_REGION", label: { RU: "Ташкентская область", UZ: "Toshkent viloyati" } },
  { code: "FERGANA", label: { RU: "Ферганская область", UZ: "Farg'ona viloyati" } },
  { code: "KHOREZM", label: { RU: "Хорезмская область", UZ: "Xorazm viloyati" } },
  { code: "KARAKALPAKSTAN", label: { RU: "Республика Каракалпакстан", UZ: "Qoraqalpog'iston Respublikasi" } },
];

const REGION_LABELS = new Map(REGIONS.map((r) => [r.code, r.label]));

export function regionLabel(code: Region, language: Language): string {
  return REGION_LABELS.get(code)?.[language] ?? code;
}

export function isRegionCode(value: string): value is Region {
  return REGION_LABELS.has(value as Region);
}
