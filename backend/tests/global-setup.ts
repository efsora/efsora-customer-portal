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
  // AWS S3 Configuration (mock values for testing)
  process.env.AWS_ACCESS_KEY_ID = "test-access-key-id";
  process.env.AWS_SECRET_ACCESS_KEY = "test-secret-access-key";
  process.env.AWS_S3_BUCKET = "test-bucket";
  process.env.AWS_S3_REGION = "us-east-1";

  // Apply migrations using Drizzle migrate
  console.log("🔄 Running database migrations...");

  // Import getDb and migrate after setting all environment variables
  const { getDb } = await import("../src/db/client.js");
  const { migrate } = await import("drizzle-orm/postgres-js/migrator");
  const db = getDb();

  // Enable pgcrypto for gen_random_uuid()
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

  // Install pg_uuidv7 extension if available
  try {
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_uuidv7;`);
  } catch {
    console.log(
      "⚠️  pg_uuidv7 extension not available, using gen_random_uuid()",
    );
  }

  // Run Drizzle migrations
  await migrate(db, { migrationsFolder: "./src/db/migrations" });

  console.log("✅ Database migrations applied");

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
