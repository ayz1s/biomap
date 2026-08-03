// Идемпотентно наполняет справочник Concept из prisma/data/concepts.ts (81 слаг,
// см. docs/cross-grade-links-feature.md). Ничего не удаляет, безопасно
// перезапускать — по аналогии с seed-curriculum.ts / CATEGORIES → TopicCategory.
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { CONCEPTS } from "./data/concepts";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  let created = 0;
  let updated = 0;
  for (const c of CONCEPTS) {
    const existing = await prisma.concept.findUnique({ where: { id: c.id } });
    if (!existing) {
      await prisma.concept.create({
        data: { id: c.id, title: c.title, categorySlug: c.categorySlug },
      });
      created++;
      continue;
    }
    if (existing.title !== c.title || existing.categorySlug !== c.categorySlug) {
      await prisma.concept.update({
        where: { id: c.id },
        data: { title: c.title, categorySlug: c.categorySlug },
      });
      updated++;
    }
  }
  console.log(`Понятия: создано ${created}, обновлено ${updated}, уже было актуально ${CONCEPTS.length - created - updated}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
