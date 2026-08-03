// Generic мягкое включение/выключение фичи-флага по ID:
//   npx tsx prisma/toggle-lesson.ts BIO5_L007 on|off
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const lessonId = process.argv[2];
  const arg = process.argv[3];
  if (!lessonId || (arg !== "on" && arg !== "off")) {
    throw new Error('Укажи: npx tsx prisma/toggle-lesson.ts BIO5_L007 on|off');
  }
  const published = arg === "on";
  const lesson = await prisma.lesson.update({ where: { id: lessonId }, data: { published } });
  console.log(`${lessonId}: published=${lesson.published}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
