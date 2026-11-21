import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// In Prisma 7 the database address is set here, not in schema.prisma
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
