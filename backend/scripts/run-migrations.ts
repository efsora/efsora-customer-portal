/**
 * Run Drizzle migrations on any database
 * Usage: tsx scripts/run-migrations.ts [database-url]
 */
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigrations(databaseUrl: string): Promise<void> {
  console.log("🔄 Running migrations...");

  // Create connection
  const sql = postgres(databaseUrl, { max: 1 });
  const db = drizzle(sql);

  try {
    // Run migrations from the migrations folder
    const migrationsFolder = join(__dirname, "../src/db/migrations");
    console.log(`📂 Migrations folder: ${migrationsFolder}`);

    await migrate(db, { migrationsFolder });

    console.log("✅ Migrations completed successfully");
  } catch (error: unknown) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

// Get database URL from command line or environment
const databaseUrl =
  process.env.DATABASE_URL ?? process.env.DB_URL ?? process.argv[2];

if (!databaseUrl) {
  console.error("❌ Error: No database URL provided");
  console.error(
    "Usage: tsx scripts/run-migrations.ts <database-url> OR set DATABASE_URL env var",
  );
  process.exit(1);
}

runMigrations(databaseUrl)
  .then(() => {
    console.log("✅ Migration script completed");
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error("❌ Migration script failed:", error);
    process.exit(1);
  });
