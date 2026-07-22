import type { Region } from "@prisma/client";

export const REGIONS: { code: Region; label: string }[] = [
  { code: "ANDIJAN", label: "Андижанская область" },
  { code: "BUKHARA", label: "Бухарская область" },
  { code: "JIZZAKH", label: "Джизакская область" },
  { code: "KASHKADARYA", label: "Кашкадарьинская область" },
  { code: "NAVOI", label: "Навоийская область" },
  { code: "NAMANGAN", label: "Наманганская область" },
  { code: "SAMARKAND", label: "Самаркандская область" },
  { code: "SURKHANDARYA", label: "Сурхандарьинская область" },
  { code: "SYRDARYA", label: "Сырдарьинская область" },
  { code: "TASHKENT_REGION", label: "Ташкентская область" },
  { code: "FERGANA", label: "Ферганская область" },
  { code: "KHOREZM", label: "Хорезмская область" },
  { code: "KARAKALPAKSTAN", label: "Республика Каракалпакстан" },
];

const REGION_LABELS = new Map(REGIONS.map((r) => [r.code, r.label]));

export function regionLabel(code: Region): string {
  return REGION_LABELS.get(code) ?? code;
}

export function isRegionCode(value: string): value is Region {
  return REGION_LABELS.has(value as Region);
}
