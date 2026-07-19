// Идемпотентный scoped-импорт ровно одного урока BIO5_L005.
// НЕ трогает пользователей, прогресс, другие уроки, Grade.status или любые
// другие данные Master-книги. Всегда импортирует с published=false.
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { importBio5L005 } from "./import-bio5-l005";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

importBio5L005(prisma)
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
