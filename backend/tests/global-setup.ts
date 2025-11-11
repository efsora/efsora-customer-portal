/**
 * Vitest Global Setup
 *
 * Runs once before all test files.
 * Starts the testcontainer and sets DATABASE_URL before any modules are loaded.
 */

import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { sql } from "drizzle-orm";

let globalContainer: StartedPostgreSqlContainer | null = null;

export async function setup() {
  console.log("🔧 Starting test database container...");

  // Start PostgreSQL testcontainer
  globalContainer = await new PostgreSqlContainer("postgres:18-alpine")
    .withDatabase("test_db")
    .withUsername("test_user")
    .withPassword("test_password")
    .withReuse() // Reuse container across test runs
    .start();

  const connectionUri = globalContainer.getConnectionUri();

  console.log("✅ Test database container started");
  console.log(`📦 Connection: ${connectionUri}`);

  // Set all required environment variables BEFORE importing any modules
  process.env.DATABASE_URL = connectionUri;
  process.env.NODE_ENV = "development";
  process.env.JWT_SECRET =
    "test-secret-key-minimum-32-chars-long-for-jwt-signing";
  process.env.OTEL_SERVICE_NAME = "backend-test";
  process.env.LOG_LEVEL = "error";
  process.env.ENABLE_TRACING = "false";
  process.env.METRICS_ENABLED = "false";
  process.env.PORT = "3000";

  // Apply schema using lazy-initialized client
  console.log("🔄 Applying database schema...");

  // Import getDb after setting all environment variables
  const { getDb } = await import("../src/db/client.js");
  const db = getDb();

  // Enable pgcrypto for gen_random_uuid()
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

  // Create users table
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

  // Create session table
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

  console.log("✅ Database schema applied");

  // Store container reference globally for teardown
  (
    global as { __TEST_CONTAINER__?: StartedPostgreSqlContainer }
  ).__TEST_CONTAINER__ = globalContainer;
}

export async function teardown() {
  console.log("🧹 Stopping test database container...");

  const container = (
    global as { __TEST_CONTAINER__?: StartedPostgreSqlContainer }
  ).__TEST_CONTAINER__;
  if (container) {
    await container.stop();
    console.log("✅ Test database container stopped");
  }
}
