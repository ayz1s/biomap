// Извлечено из data/klass_10.json (уже вычитанный источник прошлого пайплайна
// grade10, см. prisma/import-grade10.ts) — параграфы 1.1..7.6, отфильтрованы
// практические/лабораторные занятия без новой теории. Главы сверены по
// книги/biologiya_10_ru_text_1.txt: ГЛАВА I..VII.
import type { CurriculumChapter } from "./categories";

export const grade10: CurriculumChapter[] = [
  {
    chapterOrder: 1,
    chapterTitle: "Молекулярная биология",
    topics: [
      { order: 1, title: "Биология как наука", categorySlug: "cytology" },
      { order: 2, title: "Химический состав живых организмов", categorySlug: "cytology" },
      { order: 3, title: "Углеводы", categorySlug: "cytology" },
      { order: 4, title: "Липиды", categorySlug: "cytology" },
      { order: 5, title: "Белки", categorySlug: "cytology" },
      { order: 6, title: "Нуклеиновые кислоты", categorySlug: "cytology" },
    ],
  },
  {
    chapterOrder: 2,
    chapterTitle: "Клеточная биология",
    topics: [
      { order: 7, title: "Эукариотическая клетка. Клеточная стенка", categorySlug: "cytology" },
      { order: 8, title: "Цитоплазма. Немембранные органоиды клетки", categorySlug: "cytology" },
      { order: 9, title: "Мембранные органоиды клетки", categorySlug: "cytology" },
      { order: 10, title: "Ядро", categorySlug: "cytology" },
      { order: 11, title: "Прокариотическая клетка", categorySlug: "cytology" },
      { order: 12, title: "Обмен веществ в клетке. Энергетический обмен", categorySlug: "cytology" },
      { order: 13, title: "Реализация наследственной информации в клетке", categorySlug: "cytology" },
      { order: 14, title: "Размножение прокариотических и эукариотических клеток", categorySlug: "cytology" },
      { order: 15, title: "Мейоз", categorySlug: "cytology" },
    ],
  },
  {
    chapterOrder: 3,
    chapterTitle: "Жизненные процессы",
    topics: [
      { order: 16, title: "Бесполое размножение организмов", categorySlug: "genetics" },
      { order: 17, title: "Гаметогенез", categorySlug: "genetics" },
      { order: 18, title: "Половое размножение организмов", categorySlug: "genetics" },
      { order: 19, title: "Бесполое и половое размножение в жизненном цикле растений и животных", categorySlug: "genetics" },
    ],
  },
  {
    chapterOrder: 4,
    chapterTitle: "Наследственность и изменчивость",
    topics: [
      { order: 20, title: "Законы наследственности", categorySlug: "genetics" },
      { order: 21, title: "Генетика пола", categorySlug: "genetics" },
      { order: 22, title: "Наследование признаков, сцепленное с полом", categorySlug: "genetics" },
      { order: 23, title: "Изменчивость", categorySlug: "genetics" },
      { order: 24, title: "Виды генотипической изменчивости", categorySlug: "genetics" },
    ],
  },
  {
    chapterOrder: 5,
    chapterTitle: "Генная инженерия и биотехнология",
    topics: [
      { order: 25, title: "Генетическая инженерия", categorySlug: "biotech" },
      { order: 26, title: "Изменение клеточной наследственности", categorySlug: "biotech" },
      { order: 27, title: "Биотехнология", categorySlug: "biotech" },
    ],
  },
  {
    chapterOrder: 6,
    chapterTitle: "Экосистема",
    topics: [
      { order: 28, title: "Структурная организация экосистем", categorySlug: "ecology" },
      { order: 29, title: "Экологические факторы", categorySlug: "ecology" },
      { order: 30, title: "Трофическая структура экосистем", categorySlug: "ecology" },
    ],
  },
  {
    chapterOrder: 7,
    chapterTitle: "Эволюция",
    topics: [
      { order: 31, title: "Движущие факторы эволюции", categorySlug: "evolution" },
      { order: 32, title: "Естественный отбор", categorySlug: "evolution" },
      { order: 33, title: "Приспособления в органическом мире – результат эволюции", categorySlug: "evolution" },
      { order: 34, title: "Видообразование", categorySlug: "evolution" },
    ],
  },
];
