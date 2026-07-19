// Мягкое включение/выключение фичи-флага без редеплоя:
//   npx tsx prisma/toggle-bio5-l005.ts on
//   npx tsx prisma/toggle-bio5-l005.ts off
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const LESSON_ID = "BIO5_L005";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const arg = process.argv[2];
  if (arg !== "on" && arg !== "off") {
    throw new Error('Укажи "on" или "off": npx tsx prisma/toggle-bio5-l005.ts on|off');
  }
  const published = arg === "on";
  const lesson = await prisma.lesson.update({
    where: { id: LESSON_ID },
    data: { published },
  });
  console.log(`${LESSON_ID}: published=${lesson.published}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
