// Извлечено из книги/biologiya_8_ru_text.txt. OCR в этой книге читает "§" как "$",
// а римские номера глав побиты — заголовки глав сверены по порядку следования
// в теле файла и предметной логике курса (полный курс анатомии и физиологии
// человека). Лабораторные занятия без номера параграфа не заводились темами.
import type { CurriculumChapter } from "./categories";

const HA = "human-anatomy" as const;

export const grade8: CurriculumChapter[] = [
  {
    chapterOrder: 1,
    chapterTitle: "Введение",
    topics: [{ order: 1, title: "Общее понятие о человеке и его здоровье", categorySlug: HA }],
  },
  {
    chapterOrder: 2,
    chapterTitle: "Общие сведения об организме человека",
    topics: [
      { order: 2, title: "Клеточное строение организма человека", categorySlug: HA },
      { order: 3, title: "Жизненные свойства клетки и организмов", categorySlug: HA },
      { order: 4, title: "Ткани, органы и организм", categorySlug: HA },
    ],
  },
  {
    chapterOrder: 3,
    chapterTitle: "Регуляция функций организма",
    topics: [
      { order: 5, title: "Гуморальная и нервная регуляция функций организма", categorySlug: HA },
      { order: 6, title: "Железы секреции. Щитовидная железа", categorySlug: HA },
      { order: 7, title: "Строение и функции околощитовидных, вилочковой и надпочечных желез, гипофиза", categorySlug: HA },
      { order: 8, title: "Поджелудочная и половые железы, регуляция работы желез внутренней секреции", categorySlug: HA },
    ],
  },
  {
    chapterOrder: 4,
    chapterTitle: "Опорно-двигательная система",
    topics: [
      { order: 9, title: "Строение, функции и значение опорно-двигательной системы", categorySlug: HA },
      { order: 10, title: "Строение и рост костей", categorySlug: HA },
      { order: 11, title: "Оказание первой помощи при повреждении костей", categorySlug: HA },
      { order: 12, title: "Мышцы", categorySlug: HA },
      { order: 13, title: "Развитие мышц, формирование осанки человека", categorySlug: HA },
    ],
  },
  {
    chapterOrder: 5,
    chapterTitle: "Кровь",
    topics: [
      { order: 14, title: "Кровь и ее функции", categorySlug: HA },
      { order: 15, title: "Химический состав крови", categorySlug: HA },
      { order: 16, title: "Эритроциты", categorySlug: HA },
      { order: 17, title: "Лейкоциты", categorySlug: HA },
    ],
  },
  {
    chapterOrder: 6,
    chapterTitle: "Кровеносная система",
    topics: [
      { order: 18, title: "Значение кровообращения и строение сердца", categorySlug: HA },
      { order: 19, title: "Кровеносные сосуды, кровообращение", categorySlug: HA },
      { order: 20, title: "Движение крови по кровеносным сосудам", categorySlug: HA },
      { order: 21, title: "Регуляция работы органов кровеносной системы", categorySlug: HA },
      { order: 22, title: "Первая помощь при кровотечении из сосудов", categorySlug: HA },
    ],
  },
  {
    chapterOrder: 7,
    chapterTitle: "Дыхательная система",
    topics: [
      { order: 23, title: "Строение органов дыхания", categorySlug: HA },
      { order: 24, title: "Обмен газов в тканях и легких", categorySlug: HA },
      { order: 25, title: "Регуляция дыхания, болезни органов дыхания", categorySlug: HA },
    ],
  },
  {
    chapterOrder: 8,
    chapterTitle: "Пищеварительная система",
    topics: [
      { order: 26, title: "Органы пищеварительной системы", categorySlug: HA },
      { order: 27, title: "Строение и функции органов пищеварительной системы", categorySlug: HA },
      { order: 28, title: "Регуляция пищеварения", categorySlug: HA },
      { order: 29, title: "Желудочно-кишечные заболевания и их профилактика", categorySlug: HA },
    ],
  },
  {
    chapterOrder: 9,
    chapterTitle: "Обмен веществ и энергии",
    topics: [
      { order: 30, title: "Значение обмена веществ и энергии", categorySlug: HA },
      { order: 31, title: "Обмен белков, углеводов и жиров", categorySlug: HA },
      { order: 32, title: "Витамины и их значение", categorySlug: HA },
      { order: 33, title: "Потребление энергии в организме", categorySlug: HA },
    ],
  },
  {
    chapterOrder: 10,
    chapterTitle: "Кожа и мочевыделительная система",
    topics: [
      { order: 34, title: "Строение и функция кожи", categorySlug: HA },
      { order: 35, title: "Потовые железы и производные кожи", categorySlug: HA },
      { order: 36, title: "Гигиена кожи, первая помощь при повреждении кожи", categorySlug: HA },
      { order: 37, title: "Строение органов мочевыделительной системы", categorySlug: HA },
      { order: 38, title: "Функции мочевыделительной системы", categorySlug: HA },
    ],
  },
  {
    chapterOrder: 11,
    chapterTitle: "Нервная система",
    topics: [
      { order: 39, title: "Строение нервной системы", categorySlug: HA },
      { order: 40, title: "Функции нервной системы", categorySlug: HA },
      { order: 41, title: "Строение и функции спинного мозга", categorySlug: HA },
      { order: 42, title: "Строение и функции головного мозга", categorySlug: HA },
      { order: 43, title: "Строение больших полушарий головного мозга", categorySlug: HA },
      { order: 44, title: "Болезни нервной системы и их профилактика", categorySlug: HA },
    ],
  },
  {
    chapterOrder: 12,
    chapterTitle: "Высшая нервная деятельность",
    topics: [
      { order: 45, title: "Высшая нервная деятельность. Условные и безусловные рефлексы", categorySlug: HA },
      { order: 46, title: "Образование и торможение условных рефлексов", categorySlug: HA },
      { order: 47, title: "Интеллект, мышление, слова и речь", categorySlug: HA },
      { order: 48, title: "Эмоция и управление ею", categorySlug: HA },
      { order: 49, title: "Память", categorySlug: HA },
      { order: 50, title: "Сон и его значение", categorySlug: HA },
      { order: 51, title: "Типы нервной деятельности, гигиена нервной системы", categorySlug: HA },
    ],
  },
  {
    chapterOrder: 13,
    chapterTitle: "Органы чувств",
    topics: [
      { order: 52, title: "Значение органов чувств", categorySlug: HA },
      { order: 53, title: "Зрительные анализаторы", categorySlug: HA },
      { order: 54, title: "Функции органов зрения", categorySlug: HA },
      { order: 55, title: "Строение органов слуха и гигиена слуха", categorySlug: HA },
      { order: 56, title: "Органы равновесия, мышечного чувства и осязания", categorySlug: HA },
      { order: 57, title: "Органы обоняния и вкуса", categorySlug: HA },
    ],
  },
  {
    chapterOrder: 14,
    chapterTitle: "Размножение и развитие. Биологическая и социальная природа человека",
    topics: [
      { order: 58, title: "Репродуктивные органы", categorySlug: HA },
      { order: 59, title: "Оплодотворение и развитие плода", categorySlug: HA },
      { order: 60, title: "Рост и развитие ребенка", categorySlug: HA },
      { order: 61, title: "Биологические изменения и социальная природа человека", categorySlug: HA },
    ],
  },
];
