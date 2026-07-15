// Аддитивный импорт: добавляет уроки 10 класса и включает класс,
// НЕ трогая пользователей, прогресс и уроки других классов.
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { importGrade10 } from "./import-grade10";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  await importGrade10(prisma);

  await prisma.grade.update({
    where: { number: 10 },
    data: { status: "ACTIVE" },
  });
  console.log("10 класс переключён на ACTIVE.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
