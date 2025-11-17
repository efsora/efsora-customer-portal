import { env } from "#infrastructure/config/env";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "#db/schema";

/**
 * Lazy-initialized database client and Drizzle instance
 * This allows tests to set DATABASE_URL before the client is created
 */
let client: ReturnType<typeof postgres> | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

/**
 * Get or create the database client
 * Uses lazy initialization to allow DATABASE_URL to be set at runtime
 */
function getClient(): ReturnType<typeof postgres> {
  client ??= postgres(env.DATABASE_URL, {
    max: 10, // Maximum number of connections in the pool
  });
  return client;
}

/**
 * Get or create the Drizzle database instance
 * Use this for all database operations
 *
 * Lazy initialization ensures DATABASE_URL is read at runtime,
 * not at module load time. This is critical for testing where
 * DATABASE_URL is set by global-setup after modules are loaded.
 */
export function getDb(): ReturnType<typeof drizzle> {
  dbInstance ??= drizzle(getClient(), { schema });
  return dbInstance;
}

/**
 * Legacy export for backward compatibility
 * Use getDb() for new code
 */
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    return getDb()[prop as keyof ReturnType<typeof drizzle>];
  },
});

/**
 * Close database connection
 * Call this when shutting down the application
 */
export const closeDatabase = async (): Promise<void> => {
  if (client) {
    await client.end();
    client = null;
    dbInstance = null;
  }
};

/**
 * Reset database connection (for testing)
 * Forces recreation of client with new DATABASE_URL
 */
export const resetDatabase = (): void => {
  client = null;
  dbInstance = null;
};
