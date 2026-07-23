// Извлечено из оглавления книги/biologiya_9_ru_text.txt, сверено по чистым
// внутритекстовым заголовкам. Лабораторные/практические работы без новой
// теории (напр. "Лабораторная работа 1") не заводились отдельными темами.
import type { CurriculumChapter } from "./categories";

export const grade9: CurriculumChapter[] = [
  {
    chapterOrder: 1,
    chapterTitle: "Введение",
    topics: [{ order: 1, title: "Введение в биологию", categorySlug: "general-biology" }],
  },
  {
    chapterOrder: 2,
    chapterTitle: "Общие закономерности жизни",
    topics: [
      { order: 2, title: "Специфические особенности живых организмов", categorySlug: "general-biology" },
      { order: 3, title: "Уровни организации живой материи", categorySlug: "general-biology" },
    ],
  },
  {
    chapterOrder: 3,
    chapterTitle: "Многообразие организмов",
    topics: [
      { order: 4, title: "Неклеточные формы жизни", categorySlug: "microbiology" },
      { order: 5, title: "Прокариотические клетки", categorySlug: "microbiology" },
      { order: 6, title: "Эукариоты — многообразие растений", categorySlug: "botany" },
      { order: 7, title: "Царство грибов", categorySlug: "microbiology" },
      { order: 8, title: "Царство животных", categorySlug: "zoology" },
    ],
  },
  {
    chapterOrder: 4,
    chapterTitle: "Основы цитологии",
    topics: [
      { order: 9, title: "История изучения клетки и клеточная теория", categorySlug: "cytology" },
      { order: 10, title: "Методы изучения клетки", categorySlug: "cytology" },
      { order: 11, title: "Эукариотические клетки", categorySlug: "cytology" },
      { order: 12, title: "Цитоплазма. Безмембранные и мембранные органоиды клетки: эндоплазматическая сеть, рибосомы, комплекс Гольджи", categorySlug: "cytology" },
      { order: 13, title: "Митохондрии, пластиды, лизосомы и другие органоиды цитоплазмы", categorySlug: "cytology" },
      { order: 14, title: "Ядро и его строение", categorySlug: "cytology" },
      { order: 15, title: "Прокариотические и эукариотические клетки", categorySlug: "cytology" },
      { order: 16, title: "Эволюция клетки", categorySlug: "cytology" },
    ],
  },
  {
    chapterOrder: 5,
    chapterTitle: "Химические основы жизненных процессов",
    topics: [
      { order: 17, title: "Химический состав клетки", categorySlug: "cytology" },
      { order: 18, title: "Вода и неорганические вещества, входящие в состав клетки", categorySlug: "cytology" },
      { order: 19, title: "Биомолекулы", categorySlug: "cytology" },
      { order: 20, title: "Углеводы", categorySlug: "cytology" },
      { order: 21, title: "Липиды", categorySlug: "cytology" },
      { order: 22, title: "Белки и аминокислоты", categorySlug: "cytology" },
      { order: 23, title: "Состав и структура белка", categorySlug: "cytology" },
      { order: 24, title: "Свойства белков. Простые и сложные белки", categorySlug: "cytology" },
      { order: 25, title: "Функции белков", categorySlug: "cytology" },
      { order: 26, title: "Нуклеиновые кислоты", categorySlug: "cytology" },
    ],
  },
  {
    chapterOrder: 6,
    chapterTitle: "Обмен веществ и энергии в клетках",
    topics: [
      { order: 27, title: "Обмен веществ", categorySlug: "cytology" },
      { order: 28, title: "Энергетический обмен", categorySlug: "cytology" },
      { order: 29, title: "Этапы энергетического обмена", categorySlug: "cytology" },
      { order: 30, title: "Питание клетки", categorySlug: "cytology" },
      { order: 31, title: "Хемосинтез", categorySlug: "cytology" },
      { order: 32, title: "Пластический обмен в клетке", categorySlug: "cytology" },
    ],
  },
  {
    chapterOrder: 7,
    chapterTitle: "Размножение и индивидуальное развитие организмов",
    topics: [
      { order: 33, title: "Клеточный цикл", categorySlug: "genetics" },
      { order: 34, title: "Мейоз", categorySlug: "genetics" },
      { order: 35, title: "Виды размножения живых организмов", categorySlug: "genetics" },
      { order: 36, title: "Половое размножение", categorySlug: "genetics" },
      { order: 37, title: "Оплодотворение", categorySlug: "genetics" },
      { order: 38, title: "Эмбриональный период развития", categorySlug: "genetics" },
      { order: 39, title: "Постэмбриональное развитие", categorySlug: "genetics" },
      { order: 40, title: "Влияние внешней среды на развитие эмбриона", categorySlug: "genetics" },
      { order: 41, title: "Общие закономерности развития. Биогенетический закон. Закон зародышевого сходства", categorySlug: "genetics" },
    ],
  },
  {
    chapterOrder: 8,
    chapterTitle: "Основы генетики",
    topics: [
      { order: 42, title: "История развития генетики", categorySlug: "genetics" },
      { order: 43, title: "Законы Менделя. Первый закон Менделя", categorySlug: "genetics" },
      { order: 44, title: "Дигибридное скрещивание. Третий закон Менделя", categorySlug: "genetics" },
      { order: 45, title: "Взаимодействие неаллельных генов", categorySlug: "genetics" },
      { order: 46, title: "Полимерное и множественное взаимодействие генов", categorySlug: "genetics" },
      { order: 47, title: "Сцепленное наследование генов", categorySlug: "genetics" },
      { order: 48, title: "Генетика пола", categorySlug: "genetics" },
      { order: 49, title: "Изменчивость", categorySlug: "genetics" },
      { order: 50, title: "Мутационная (генотипическая) изменчивость", categorySlug: "genetics" },
      { order: 51, title: "Методы изучения генетики человека", categorySlug: "genetics" },
      { order: 52, title: "Наследственные болезни у человека", categorySlug: "genetics" },
    ],
  },
  {
    chapterOrder: 9,
    chapterTitle: "Основы селекции и биотехнологии",
    topics: [
      { order: 53, title: "Центры многообразия и происхождения культурных растений", categorySlug: "biotech" },
      { order: 54, title: "Селекция растений и животных", categorySlug: "biotech" },
      { order: 55, title: "Селекция и биотехнология", categorySlug: "biotech" },
      { order: 56, title: "Достижения ученых Узбекистана в области биологии и селекции", categorySlug: "biotech" },
    ],
  },
];
