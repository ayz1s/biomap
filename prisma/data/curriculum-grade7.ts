// Извлечено из оглавления книги/biologiya_7_ru_text.txt (формат "X.Y. Название").
// Практические/лабораторные/проектные занятия (X.Y без новой теории) не заводятся
// отдельными темами — они привязаны к соседней теоретической теме той же главы.
import type { CurriculumChapter } from "./categories";

export const grade7: CurriculumChapter[] = [
  {
    chapterOrder: 1,
    chapterTitle: "Разнообразие живых организмов",
    topics: [
      { order: 1, title: "Биология – наука о жизни", categorySlug: "general-biology" },
      { order: 2, title: "Разнообразие живых организмов", categorySlug: "general-biology" },
      { order: 3, title: "Бактерии. Протоктисты. Грибы", categorySlug: "microbiology" },
      { order: 4, title: "Разнообразие растений. Споровые растения", categorySlug: "botany" },
      { order: 5, title: "Семенные растения", categorySlug: "botany" },
      { order: 6, title: "Разнообразие беспозвоночных", categorySlug: "zoology" },
      { order: 7, title: "Разнообразие позвоночных животных. Рыбы, земноводные и рептилии", categorySlug: "zoology" },
      { order: 8, title: "Птицы и млекопитающие", categorySlug: "zoology" },
    ],
  },
  {
    chapterOrder: 2,
    chapterTitle: "Молекулярный и клеточный уровни жизни",
    topics: [
      { order: 9, title: "Клетка – структурная единица живых организмов", categorySlug: "cytology" },
      { order: 10, title: "Ткани", categorySlug: "cytology" },
    ],
  },
  {
    chapterOrder: 3,
    chapterTitle: "Орган и система органов",
    topics: [
      { order: 11, title: "Вегетативные органы цветковых растений. Корень", categorySlug: "botany" },
      { order: 12, title: "Побег", categorySlug: "botany" },
      { order: 13, title: "Генеративные органы растений. Цветок", categorySlug: "botany" },
      { order: 14, title: "Плоды", categorySlug: "botany" },
      { order: 15, title: "Органы и системы органов человека и животных", categorySlug: "human-anatomy" },
    ],
  },
  {
    chapterOrder: 4,
    chapterTitle: "Координация и саморегуляция",
    topics: [
      { order: 16, title: "Саморегуляция живых организмов", categorySlug: "general-biology" },
      { order: 17, title: "Нервная система", categorySlug: "human-anatomy" },
    ],
  },
  {
    chapterOrder: 5,
    chapterTitle: "Питание",
    topics: [
      { order: 18, title: "Питание организмов", categorySlug: "general-biology" },
      { order: 19, title: "Питание животных", categorySlug: "zoology" },
      { order: 20, title: "Пищеварительная система человека", categorySlug: "human-anatomy" },
    ],
  },
  {
    chapterOrder: 6,
    chapterTitle: "Дыхание",
    topics: [
      { order: 21, title: "Сущность дыхания. Дыхание растений", categorySlug: "botany" },
      { order: 22, title: "Дыхание человека и животных", categorySlug: "human-anatomy" },
    ],
  },
  {
    chapterOrder: 7,
    chapterTitle: "Транспорт веществ в живых организмах",
    topics: [
      { order: 23, title: "Транспорт веществ в растениях", categorySlug: "botany" },
      { order: 24, title: "Кровеносная система беспозвоночных", categorySlug: "zoology" },
      { order: 25, title: "Кровеносная система позвоночных", categorySlug: "zoology" },
    ],
  },
  {
    chapterOrder: 8,
    chapterTitle: "Выделение (экскреция)",
    topics: [
      { order: 26, title: "Выделение", categorySlug: "general-biology" },
      { order: 27, title: "Выделения человека и животных", categorySlug: "human-anatomy" },
    ],
  },
  {
    chapterOrder: 9,
    chapterTitle: "Движение",
    topics: [
      { order: 28, title: "Движение живых организмов", categorySlug: "general-biology" },
      { order: 29, title: "Органы движения беспозвоночных", categorySlug: "zoology" },
      { order: 30, title: "Опорно-двигательная система позвоночных", categorySlug: "zoology" },
    ],
  },
  {
    chapterOrder: 10,
    chapterTitle: "Размножение, рост и развитие",
    topics: [
      { order: 31, title: "Размножение организмов", categorySlug: "general-biology" },
      { order: 32, title: "Индивидуальное развитие растений", categorySlug: "botany" },
      { order: 33, title: "Размножение животных", categorySlug: "zoology" },
      { order: 34, title: "Индивидуальное развитие животных", categorySlug: "zoology" },
    ],
  },
  {
    chapterOrder: 11,
    chapterTitle: "Вид, популяция, экосистема, биосфера",
    topics: [
      { order: 35, title: "Вид, популяция", categorySlug: "ecology" },
      { order: 36, title: "Экосистемы. Биосфера", categorySlug: "ecology" },
    ],
  },
];
