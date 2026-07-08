import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Прямое (не через pgbouncer) подключение — нужно для миграций Prisma
    url: env("DIRECT_URL"),
  },
});
