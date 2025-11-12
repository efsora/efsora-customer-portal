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

  // Create session table (no FK for simplicity in tests)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS session (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL,
      token text NOT NULL UNIQUE,
      created_at timestamp DEFAULT now() NOT NULL,
      expires_at timestamp NOT NULL,
      last_active_at timestamp DEFAULT now() NOT NULL
    );
  `);

  // Create companies table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS companies (
      id serial PRIMARY KEY,
      name text NOT NULL UNIQUE,
      logo_url text,
      admin_user_id uuid,
      created_at timestamp DEFAULT now() NOT NULL,
      updated_at timestamp DEFAULT now() NOT NULL
    );
  `);

  // Create roles table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS roles (
      id serial PRIMARY KEY,
      name text NOT NULL UNIQUE,
      created_at timestamp DEFAULT now() NOT NULL
    );
  `);

  // Create progress_status table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS progress_status (
      id serial PRIMARY KEY,
      name text NOT NULL UNIQUE,
      created_at timestamp DEFAULT now() NOT NULL
    );
  `);

  // Create projects table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS projects (
      id serial PRIMARY KEY,
      name text NOT NULL,
      company_id integer,
      status integer,
      created_at timestamp DEFAULT now() NOT NULL,
      updated_at timestamp DEFAULT now() NOT NULL,
      UNIQUE(name, company_id)
    );
  `);

  // Create milestones table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS milestones (
      id serial PRIMARY KEY,
      project_id integer,
      assignee_user_id uuid,
      due_date timestamp,
      description text,
      created_at timestamp DEFAULT now() NOT NULL,
      updated_at timestamp DEFAULT now() NOT NULL
    );
  `);

  // Create events table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS events (
      id serial PRIMARY KEY,
      event_datetime timestamp NOT NULL,
      description text,
      owner_user_id uuid,
      milestone_id integer,
      status integer,
      created_at timestamp DEFAULT now() NOT NULL,
      updated_at timestamp DEFAULT now() NOT NULL
    );
  `);

  // Add new fields to users table
  await db.execute(sql`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS surname text;
  `);
  await db.execute(sql`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS bio text;
  `);
  await db.execute(sql`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS company_id integer;
  `);
  await db.execute(sql`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id integer;
  `);
  await db.execute(sql`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS project_id integer;
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
