import { defineConfig } from "drizzle-kit";
import { dbConfig } from "@repo/config";

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: dbConfig.url,
  },
});
