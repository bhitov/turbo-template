import { beforeAll, afterAll } from "vitest";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db } from "../src/db/index.js";
import fs from "fs";
import path from "path";

beforeAll(async () => {
  // Create data directory
  if (!fs.existsSync("data")) {
    fs.mkdirSync("data");
  }
  
  // Run migrations
  await migrate(db, { migrationsFolder: "drizzle" });
});

afterAll(async () => {
  // Clean up test database
  if (fs.existsSync("data/database.db")) {
    fs.unlinkSync("data/database.db");
  }
});
