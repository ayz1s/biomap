import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const GRADES = [5, 6, 7, 8, 9, 10, 11];

const TOPICS = [
  {
    key: "cell",
    name: "Клетка",
    icon: "microscope",
    colorKey: "blue",
    grades: {
      5: "Что такое клетка, основные части",
      6: "Клеточная мембрана и органоиды",
      7: "Функции органоидов, деление клетки",
      8: "Деление клетки подробно",
      9: "Обмен веществ в клетке",
      10: "Энергетический обмен",
      11: "Регуляция процессов в клетке",
    },
  },
  {
    key: "genetics",
    name: "Генетика",
    icon: "dna",
    colorKey: "purple",
    grades: {
      9: "Основы наследственности",
      10: "Законы Менделя",
      11: "Генетика человека и популяций",
    },
  },
  {
    key: "evolution",
    name: "Эволюция",
    icon: "footprints",
    colorKey: "amber",
    grades: {
      7: "Многообразие живых организмов",
      8: "Приспособленность организмов",
      9: "Основы теории эволюции",
      10: "Движущие силы эволюции",
      11: "Происхождение человека",
    },
  },
  {
    key: "plants",
    name: "Растения",
    icon: "sprout",
    colorKey: "green",
    grades: {
      5: "Строение растения: корень, стебель, лист",
      6: "Фотосинтез и питание растений",
      7: "Размножение растений",
      8: "Систематика растений",
      9: "Растительные сообщества",
      10: "Растения в экосистемах",
      11: "Растения и человек",
    },
  },
  {
    key: "human",
    name: "Человек",
    icon: "user",
    colorKey: "red",
    grades: {
      8: "Строение тела человека",
      9: "Системы органов",
      10: "Физиология человека",
      11: "Здоровье и гигиена",
    },
  },
  {
    key: "ecology",
    name: "Экология",
    icon: "globe",
    colorKey: "teal",
    grades: {
      6: "Организм и среда обитания",
      7: "Взаимосвязи в природе",
      8: "Экологические факторы",
      9: "Экосистемы",
      10: "Круговорот веществ",
      11: "Человек и биосфера",
    },
  },
  {
    key: "biosphere",
    name: "Биосфера",
    icon: "layers",
    colorKey: "emerald",
    grades: {
      9: "Понятие биосферы",
      10: "Границы и состав биосферы",
      11: "Устойчивость биосферы",
    },
  },
] as const;

async function main() {
  console.log("Очистка старых данных...");
  await prisma.userMistake.deleteMany();
  await prisma.userLessonProgress.deleteMany();
  await prisma.repetitionItem.deleteMany();
  await prisma.userStreak.deleteMany();
  await prisma.hint.deleteMany();
  await prisma.questionOption.deleteMany();
  await prisma.question.deleteMany();
  await prisma.lessonCard.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.topicConnection.deleteMany();
  await prisma.topicGradeLink.deleteMany();
  await prisma.crossTopic.deleteMany();
  await prisma.grade.deleteMany();

  console.log("Классы...");
  const gradeByNumber = new Map<number, { id: string }>();
  for (const number of GRADES) {
    const grade = await prisma.grade.create({
      data: { number, status: number === 5 ? "ACTIVE" : "SOON" },
    });
    gradeByNumber.set(number, grade);
  }

  console.log("Сквозные темы...");
  const topicByKey = new Map<string, { id: string }>();
  for (const [order, topic] of TOPICS.entries()) {
    const crossTopic = await prisma.crossTopic.create({
      data: { name: topic.name, icon: topic.icon, colorKey: topic.colorKey, order },
    });
    topicByKey.set(topic.key, crossTopic);

    let linkOrder = 0;
    for (const [gradeNumber, subtitle] of Object.entries(topic.grades)) {
      await prisma.topicGradeLink.create({
        data: {
          crossTopicId: crossTopic.id,
          gradeId: gradeByNumber.get(Number(gradeNumber))!.id,
          subtitle,
          order: linkOrder++,
        },
      });
    }
  }

  console.log("Связь тем...");
  await prisma.topicConnection.create({
    data: {
      fromTopicId: topicByKey.get("plants")!.id,
      toTopicId: topicByKey.get("cell")!.id,
      description:
        "Фотосинтез происходит внутри клеток листа — чтобы понять процесс глубже, изучи строение клетки.",
    },
  });

  console.log("Полный микроурок: Растения, 5 класс...");
  const plantsGrade5Link = await prisma.topicGradeLink.findFirstOrThrow({
    where: { crossTopicId: topicByKey.get("plants")!.id, gradeId: gradeByNumber.get(5)!.id },
  });

  const lesson = await prisma.lesson.create({
    data: {
      topicGradeLinkId: plantsGrade5Link.id,
      title: "Как растение получает воду и создаёт питание",
      order: 0,
      cards: {
        create: [
          {
            type: "MAIN_IDEA",
            order: 0,
            title: "Главная мысль",
            content:
              "Растение — это единая система транспорта воды и питательных веществ: от корня до листа.",
          },
          {
            type: "EXPLANATION",
            order: 1,
            title: "Объяснение",
            content:
              "Корень всасывает воду и минеральные соли из почвы. Стебель проводит их вверх, к листьям. В листьях, под действием света, вода и углекислый газ превращаются в питательные вещества — этот процесс называется фотосинтез.",
          },
          {
            type: "ILLUSTRATION",
            order: 2,
            title: "Схема",
            content: "Корень → Всасывание воды → Стебель → Лист → Фотосинтез",
            svgKey: "root-to-leaf-flow",
          },
          {
            type: "CONNECTION",
            order: 3,
            title: "Связь с другой темой",
            content:
              "Фотосинтез происходит внутри клеток листа — вспомни, как устроена клетка растения (тема «Клетка»).",
          },
          {
            type: "COMMON_MISTAKE",
            order: 4,
            title: "Типичная ошибка",
            content:
              "Многие думают, что растение получает энергию прямо из почвы. На самом деле почва даёт только воду и минералы — энергию растение создаёт само, используя свет.",
          },
          {
            type: "MINI_QUESTION",
            order: 5,
            title: "Мини-вопрос",
            content:
              "Как называется процесс, при котором растение создаёт питательные вещества с помощью света?",
          },
        ],
      },
      questions: {
        create: [
          {
            order: 0,
            text: "Какая часть растения отвечает за всасывание воды из почвы?",
            options: {
              create: [
                { order: 0, text: "Корень", isCorrect: true },
                { order: 1, text: "Стебель", isCorrect: false },
                { order: 2, text: "Лист", isCorrect: false },
                { order: 3, text: "Цветок", isCorrect: false },
              ],
            },
            hints: {
              create: [
                { order: 0, text: "Вспомни, какая часть растения обычно находится под землёй." },
                { order: 1, text: "Она достаёт воду и минералы прямо из почвы." },
              ],
            },
          },
          {
            order: 1,
            text: "Где в основном происходит фотосинтез?",
            options: {
              create: [
                { order: 0, text: "В корне", isCorrect: false },
                { order: 1, text: "В листе", isCorrect: true },
                { order: 2, text: "В стебле", isCorrect: false },
                { order: 3, text: "В цветке", isCorrect: false },
              ],
            },
            hints: {
              create: [
                { order: 0, text: "Этой части растения нужно много света." },
                { order: 1, text: "Она обычно плоская и зелёная." },
              ],
            },
          },
          {
            order: 2,
            text: "Что растение получает из почвы через корень?",
            options: {
              create: [
                { order: 0, text: "Свет", isCorrect: false },
                { order: 1, text: "Воду и минеральные соли", isCorrect: true },
                { order: 2, text: "Кислород", isCorrect: false },
                { order: 3, text: "Готовый сахар", isCorrect: false },
              ],
            },
            hints: {
              create: [
                { order: 0, text: "Свет растение получает не из почвы, а сверху." },
                { order: 1, text: "Это то же самое, что впитывает губка в мокрой земле." },
              ],
            },
          },
          {
            order: 3,
            text: "Как называется процесс образования питательных веществ с помощью света?",
            options: {
              create: [
                { order: 0, text: "Дыхание", isCorrect: false },
                { order: 1, text: "Испарение", isCorrect: false },
                { order: 2, text: "Фотосинтез", isCorrect: true },
                { order: 3, text: "Всасывание", isCorrect: false },
              ],
            },
            hints: {
              create: [
                { order: 0, text: "Слово начинается с «фото» — как и «фотография», связано со светом." },
                { order: 1, text: "Происходит в листьях, в зелёных клетках." },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("Готово. Урок:", lesson.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
