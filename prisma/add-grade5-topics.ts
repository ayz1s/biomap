// Идемпотентно добавляет связки CrossTopic×5 класс, которых не было в БД,
// чтобы под них можно было импортировать уроки BIO5_L007-L030 (план "Карта
// уроков" покрывает бактерии/грибы/вирусы, животных, человека и экологию —
// для них не было ни одной темы на 5 класс). Создаёт 2 новые темы
// ("Микробы и грибы", "Животные") и добавляет 5 класс к уже существующим
// темам "Человек" и "Экология" (у них раньше начиналось с 8/6 класса).
// Не трогает Клетку/Растения (там 5 класс уже есть) и не переставляет
// порядок никаких уже существующих тем.
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function ensureNewTopic(opts: {
  name: string;
  icon: string;
  colorKey: string;
  order: number;
  subtitle: string;
}) {
  const grade5 = await prisma.grade.findUniqueOrThrow({ where: { number: 5 } });
  let topic = await prisma.crossTopic.findFirst({ where: { name: opts.name } });
  if (!topic) {
    topic = await prisma.crossTopic.create({
      data: { name: opts.name, icon: opts.icon, colorKey: opts.colorKey, order: opts.order },
    });
    console.log(`CrossTopic создан: ${opts.name}`);
  } else {
    console.log(`CrossTopic уже существует: ${opts.name}`);
  }

  const existingLink = await prisma.topicGradeLink.findFirst({
    where: { crossTopicId: topic.id, gradeId: grade5.id },
  });
  if (!existingLink) {
    await prisma.topicGradeLink.create({
      data: { crossTopicId: topic.id, gradeId: grade5.id, subtitle: opts.subtitle, order: 0 },
    });
    console.log(`  + TopicGradeLink (5 класс) создан для ${opts.name}`);
  } else {
    console.log(`  TopicGradeLink (5 класс) уже существует для ${opts.name}`);
  }
}

async function ensureGrade5PrependedTo(topicName: string, subtitle: string) {
  const grade5 = await prisma.grade.findUniqueOrThrow({ where: { number: 5 } });
  const topic = await prisma.crossTopic.findFirstOrThrow({ where: { name: topicName } });

  const existingLink = await prisma.topicGradeLink.findFirst({
    where: { crossTopicId: topic.id, gradeId: grade5.id },
  });
  if (existingLink) {
    console.log(`TopicGradeLink (5 класс) уже существует для ${topicName}`);
    return;
  }

  const otherLinks = await prisma.topicGradeLink.findMany({
    where: { crossTopicId: topic.id },
    orderBy: { order: "asc" },
  });

  await prisma.$transaction(async (tx) => {
    // Сдвигаем существующие связки на +1, чтобы 5 класс встал первым в таймлайне
    for (const link of otherLinks) {
      await tx.topicGradeLink.update({ where: { id: link.id }, data: { order: link.order + 1 } });
    }
    await tx.topicGradeLink.create({
      data: { crossTopicId: topic.id, gradeId: grade5.id, subtitle, order: 0 },
    });
  });
  console.log(`+ TopicGradeLink (5 класс) добавлен в начало таймлайна для ${topicName}`);
}

async function main() {
  await ensureNewTopic({
    name: "Микробы и грибы",
    icon: "flask-conical",
    colorKey: "orange",
    order: 7,
    subtitle: "Бактерии, грибы и вирусы: строение и значение",
  });

  await ensureNewTopic({
    name: "Животные",
    icon: "paw-print",
    colorKey: "rose",
    order: 8,
    subtitle: "Царство животных: от простейших до млекопитающих",
  });

  await ensureGrade5PrependedTo("Человек", "От клетки к системе органов человека");
  await ensureGrade5PrependedTo("Экология", "Экологические факторы и охрана природы");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
