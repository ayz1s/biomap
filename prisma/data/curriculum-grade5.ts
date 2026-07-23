// Извлечено из книги/biologiya_5_ru_text.txt (чистые заголовки "§ N. Название").
import type { CurriculumChapter } from "./categories";

export const grade5: CurriculumChapter[] = [
  {
    chapterOrder: 1,
    chapterTitle: "Биология – наука о живых организмах",
    topics: [
      { order: 1, title: "Биология – наука о жизни", categorySlug: "general-biology" },
      { order: 2, title: "Признаки, свойственные живым организмам", categorySlug: "general-biology" },
      { order: 3, title: "Методы исследования в биологии", categorySlug: "general-biology" },
      { order: 4, title: "Клетка – основа жизни", categorySlug: "cytology" },
    ],
  },
  {
    chapterOrder: 2,
    chapterTitle: "Разнообразие живых организмов",
    topics: [
      { order: 5, title: "Общие сведения о живых организмах", categorySlug: "general-biology" },
      { order: 6, title: "Царство бактерий", categorySlug: "microbiology" },
      { order: 7, title: "Царство грибов", categorySlug: "microbiology" },
      { order: 8, title: "Царство растений", categorySlug: "botany" },
      { order: 9, title: "Низшие растения", categorySlug: "botany" },
      { order: 10, title: "Высшие растения", categorySlug: "botany" },
      { order: 11, title: "Лекарственные и ядовитые растения, распространенные в Узбекистане", categorySlug: "botany" },
      { order: 12, title: "Царство животных", categorySlug: "zoology" },
      { order: 13, title: "Беспозвоночные животные", categorySlug: "zoology" },
      { order: 14, title: "Позвоночные животные", categorySlug: "zoology" },
      { order: 15, title: "Cистема органов человека", categorySlug: "human-anatomy" },
    ],
  },
  {
    chapterOrder: 3,
    chapterTitle: "Организм и окружающая среда",
    topics: [
      { order: 16, title: "Экологические факторы", categorySlug: "ecology" },
      { order: 17, title: "Человек и природа", categorySlug: "ecology" },
      { order: 18, title: "Охрана природы", categorySlug: "ecology" },
    ],
  },
];
