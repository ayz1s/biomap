// Предметные разделы для вкладки "По темам" — не привязаны к классу, каждый
// собирает темы одного предмета из всех классов сразу (напр. "Ботаника" —
// темы растений из 5, 6 и 7 классов в одном месте). Порядок соответствует
// традиционной программе для абитуриентов: от общих понятий к прикладным.
export interface CategoryDef {
  slug: string;
  name: string;
  icon: string;
  colorKey: string;
  order: number;
}

export const CATEGORIES: CategoryDef[] = [
  { slug: "general-biology", name: "Общая биология и методы науки", icon: "compass", colorKey: "blue", order: 0 },
  { slug: "cytology", name: "Цитология и молекулярная биология", icon: "dna", colorKey: "purple", order: 1 },
  { slug: "microbiology", name: "Микробиология", icon: "flask-conical", colorKey: "orange", order: 2 },
  { slug: "botany", name: "Ботаника", icon: "sprout", colorKey: "green", order: 3 },
  { slug: "zoology", name: "Зоология", icon: "paw-print", colorKey: "rose", order: 4 },
  { slug: "human-anatomy", name: "Анатомия и физиология человека", icon: "heart-pulse", colorKey: "red", order: 5 },
  { slug: "genetics", name: "Генетика и изменчивость", icon: "git-branch", colorKey: "indigo", order: 6 },
  { slug: "evolution", name: "Эволюция и происхождение жизни", icon: "trending-up", colorKey: "amber", order: 7 },
  { slug: "ecology", name: "Экология и охрана природы", icon: "globe", colorKey: "teal", order: 8 },
  { slug: "biotech", name: "Биотехнология и генная инженерия", icon: "microscope", colorKey: "cyan", order: 9 },
];

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export interface CurriculumTopic {
  order: number;
  title: string;
  categorySlug: CategorySlug;
}

export interface CurriculumChapter {
  chapterOrder: number;
  chapterTitle: string;
  topics: CurriculumTopic[];
}
