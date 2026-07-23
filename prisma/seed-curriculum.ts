// Идемпотентно наполняет новую структуру тем: 10 TopicCategory + Topic на
// каждый параграф учебника 5-11 классов (см. prisma/data/curriculum-grade*.ts).
// Ничего не удаляет и не трогает CrossTopic/TopicGradeLink/Lesson — безопасно
// перезапускать. Часть 1 миграции реструктуризации тем (см. план в
// C:\Users\HP\.claude\plans\typed-tinkering-galaxy.md).
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { CATEGORIES } from "./data/categories";
import { grade5 } from "./data/curriculum-grade5";
import { grade6 } from "./data/curriculum-grade6";
import { grade7 } from "./data/curriculum-grade7";
import { grade8 } from "./data/curriculum-grade8";
import { grade9 } from "./data/curriculum-grade9";
import { grade10 } from "./data/curriculum-grade10";
import { grade11 } from "./data/curriculum-grade11";
import type { CurriculumChapter } from "./data/categories";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const CURRICULA: Record<number, CurriculumChapter[]> = {
  5: grade5,
  6: grade6,
  7: grade7,
  8: grade8,
  9: grade9,
  10: grade10,
  11: grade11,
};

async function main() {
  const categoryIdBySlug = new Map<string, string>();
  for (const c of CATEGORIES) {
    let category = await prisma.topicCategory.findFirst({ where: { name: c.name } });
    if (!category) {
      category = await prisma.topicCategory.create({
        data: { name: c.name, icon: c.icon, colorKey: c.colorKey, order: c.order },
      });
      console.log(`Категория создана: ${c.name}`);
    }
    categoryIdBySlug.set(c.slug, category.id);
  }

  for (const [gradeNumberStr, chapters] of Object.entries(CURRICULA)) {
    const gradeNumber = Number(gradeNumberStr);
    const grade = await prisma.grade.findUniqueOrThrow({ where: { number: gradeNumber } });

    let created = 0;
    let skipped = 0;
    for (const chapter of chapters) {
      for (const topic of chapter.topics) {
        const existing = await prisma.topic.findUnique({
          where: { gradeId_order: { gradeId: grade.id, order: topic.order } },
        });
        const categoryId = categoryIdBySlug.get(topic.categorySlug);
        if (!categoryId) throw new Error(`Неизвестная категория ${topic.categorySlug} у темы "${topic.title}"`);

        if (existing) {
          skipped++;
          continue;
        }
        await prisma.topic.create({
          data: {
            gradeId: grade.id,
            categoryId,
            chapterTitle: chapter.chapterTitle,
            chapterOrder: chapter.chapterOrder,
            title: topic.title,
            order: topic.order,
          },
        });
        created++;
      }
    }
    console.log(`${gradeNumber} класс: создано ${created}, уже было ${skipped}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
