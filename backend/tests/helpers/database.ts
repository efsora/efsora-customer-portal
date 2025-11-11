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
import { getDb, resetDatabase } from "#db/client";

// Shared testcontainer instance for all tests (started once)
let testContainer: StartedPostgreSqlContainer | null = null;

/**
 * Setup PostgreSQL testcontainer
 * Starts a PostgreSQL 18 Alpine container matching production environment
 *
 * @returns Connection string for the test database
 */
export async function setupTestDatabase(): Promise<string> {
  // Return existing connection if already setup
  if (testContainer) {
    return testContainer.getConnectionUri();
  }

  // Start PostgreSQL testcontainer
  testContainer = await new PostgreSqlContainer("postgres:18-alpine")
    .withDatabase("test_db")
    .withUsername("test_user")
    .withPassword("test_password")
    .withReuse() // Reuse container across test runs for speed
    .start();

  const connectionUri = testContainer.getConnectionUri();

  // Set DATABASE_URL for the lazy-initialized client
  process.env.DATABASE_URL = connectionUri;

  // Reset any existing database connection to force recreation with new URL
  resetDatabase();

  // Apply schema directly to test database (simpler than migrations)
  await applySchema();

  return connectionUri;
}

/**
 * Apply schema directly to test database
 * Uses the Drizzle schema to create tables without migrations
 * Note: Uses gen_random_uuid() instead of uuidv7() for simplicity in tests
 */
export async function applySchema(): Promise<void> {
  // Use the lazy-initialized database client
  const db = getDb();

  // Enable pgcrypto extension for gen_random_uuid()
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

  // Create users table directly from schema
  // Note: Using gen_random_uuid() instead of uuidv7() for test simplicity
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email text NOT NULL UNIQUE,
      name text,
      password text NOT NULL,
      created_at timestamp DEFAULT now() NOT NULL,
      updated_at timestamp DEFAULT now() NOT NULL
    );
  `);

  // Create session table directly from schema
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS session (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token text NOT NULL UNIQUE,
      created_at timestamp DEFAULT now() NOT NULL,
      expires_at timestamp NOT NULL,
      last_active_at timestamp DEFAULT now() NOT NULL
    );
  `);
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
  // Order matters: session depends on users, so truncate in reverse dependency order
  const tables = ["session", "users"]; // Add more tables as schema grows

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
