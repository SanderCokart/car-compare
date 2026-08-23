import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema";

export const DATA_DIR = path.join(process.cwd(), "data");
export const DB_PATH = path.join(DATA_DIR, "carcompare.db");
export const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
export const MIGRATIONS_DIR = path.join(process.cwd(), "drizzle");

export { schema };

type AppDb = BetterSQLite3Database<typeof schema>;

const globalForDb = globalThis as unknown as {
  sqlite?: Database.Database;
  db?: AppDb;
};

export function ensureDataDirs() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export function migrateDb(db: AppDb) {
  migrate(db, { migrationsFolder: MIGRATIONS_DIR });
}

/** Opens `data/carcompare.db`, enables WAL/FKs, and applies Drizzle migrations. */
export function getDb(): AppDb {
  if (globalForDb.db) return globalForDb.db;

  ensureDataDirs();
  const sqlite = new Database(DB_PATH);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  const db = drizzle(sqlite, { schema });
  migrateDb(db);

  globalForDb.sqlite = sqlite;
  globalForDb.db = db;
  return db;
}
