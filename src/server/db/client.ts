import "server-only";

import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { getServerEnvironment } from "@/env";
import * as schema from "@/server/db/schema";

type Database = NodePgDatabase<typeof schema>;

const databaseGlobal = globalThis as typeof globalThis & {
  rrDatabase?: Database;
  rrPool?: Pool;
};

export function getDatabase(): Database {
  if (databaseGlobal.rrDatabase) {
    return databaseGlobal.rrDatabase;
  }

  const environment = getServerEnvironment();
  const pool = new Pool({
    connectionString: environment.DATABASE_URL,
    ssl: environment.DATABASE_SSL ? { rejectUnauthorized: true } : undefined,
    max: environment.APP_ENV === "production" ? 10 : 3,
  });
  const database = drizzle(pool, { schema });

  if (environment.APP_ENV !== "production") {
    databaseGlobal.rrPool = pool;
    databaseGlobal.rrDatabase = database;
  }

  return database;
}
