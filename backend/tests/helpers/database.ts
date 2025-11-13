/**
 * Database Test Helpers
 *
 * Provides utilities for integration testing with PostgreSQL testcontainers.
 * Works with lazy-initialized database client to ensure proper test isolation.
 */

import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { getDb, resetDatabase } from "#db/client";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Shared testcontainer instance for all tests (started once)
let testContainer: StartedPostgreSqlContainer | null = null;

/**
 * Setup PostgreSQL testcontainer
 * Starts a PostgreSQL 18 Alpine container matching production environment
 *
 * @returns Connection string for the test database
 */
export async function setupTestDatabase(): Promise<string> {
  let connectionUri: string;

  // Start container if not already running
  if (!testContainer) {
    testContainer = await new PostgreSqlContainer("postgres:18-alpine")
      .withDatabase("test_db")
      .withUsername("test_user")
      .withPassword("test_password")
      // .withReuse() // Disabled temporarily to ensure fresh schema
      .start();

    connectionUri = testContainer.getConnectionUri();

    // Set DATABASE_URL for the lazy-initialized client
    process.env.DATABASE_URL = connectionUri;

    // Reset any existing database connection to force recreation with new URL
    resetDatabase();

    // Run migrations on test database (only on first setup)
    await runMigrations();
  } else {
    connectionUri = testContainer.getConnectionUri();
  }

  return connectionUri;
}

/**
 * Run Drizzle migrations on test database
 * Uses the same migration files as production for consistency
 */
export async function runMigrations(): Promise<void> {
  const db = getDb();

  // Enable pgcrypto extension (for UUID generation)
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

  // Install pg_uuidv7 extension if available (for uuidv7() function)
  // This will fail silently if the extension is not available
  try {
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_uuidv7;`);
  } catch {
    // Extension not available, migrations will use gen_random_uuid() as fallback
    console.log(
      "⚠️  pg_uuidv7 extension not available, using gen_random_uuid()",
    );
  }

  // Run Drizzle migrations from the migrations folder
  const migrationsFolder = join(__dirname, "../../src/db/migrations");
  console.log("📂 Running migrations from:", migrationsFolder);

  await migrate(db, { migrationsFolder });

  console.log("✅ Test database migrations completed");
}

/**
 * Create a Drizzle database instance for testing
 *
 * @deprecated Use getTestDb() instead - now uses lazy-initialized client
 * @returns Drizzle database instance
 */
export function createTestDb() {
  return getDb();
}

/**
 * Get the shared test database instance
 * Uses the lazy-initialized database client from #db/client
 *
 * @returns Shared Drizzle database instance
 */
export function getTestDb() {
  return getDb();
}

/**
 * Cleanup database by truncating all tables
 * Uses CASCADE to handle foreign key constraints
 * Uses the lazy-initialized database client
 */
export async function cleanupDatabase(): Promise<void> {
  const db = getDb();

  // Truncate all tables in the schema
  // CASCADE automatically handles foreign key constraints
  // Order doesn't matter with CASCADE, but we list dependencies first for clarity
  const tables = [
    "events",
    "milestones",
    "projects",
    "companies",
    "roles",
    "progress_status",
    "session",
    "users",
  ];

  for (const table of tables) {
    await db.execute(sql.raw(`TRUNCATE TABLE "${table}" CASCADE`));
  }
}

/**
 * Teardown test database container
 * Closes connections and stops the container
 */
export async function teardownTestDatabase(): Promise<void> {
  // Import closeDatabase from client to properly close connection
  const { closeDatabase } = await import("#db/client");
  await closeDatabase();

  // Stop testcontainer
  if (testContainer) {
    await testContainer.stop();
    testContainer = null;
  }
}

/**
 * Get test database connection string
 * Must call setupTestDatabase() first
 *
 * @returns Connection string for test database
 * @throws Error if test database is not setup
 */
export function getTestConnectionString(): string {
  if (!testContainer) {
    throw new Error(
      "Test database not initialized. Call setupTestDatabase() first.",
    );
  }
  return testContainer.getConnectionUri();
}
