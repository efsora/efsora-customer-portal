#!/usr/bin/env tsx

/**
 * Seed Data Script
 * Seeds roles and progress statuses into the database
 */

import { eq } from "drizzle-orm";
import { db } from "../src/db/client";
import { progressStatus, roles } from "../src/db/schema";

const ROLES = ["MANAGEMENT", "LEGAL", "PRODUCT", "DEVELOPMENT"];

const PROGRESS_STATUSES = [
  "SCHEDULED",
  "IN_PROGRESS",
  "WAITING",
  "INTERNAL_REVIEW",
  "DELIVERED",
  "COMPLETED",
  "REVISION",
  "BLOCKED",
  "MANAGEMENT",
  "PRODUCT",
  "LEGAL",
  "FINANCIAL",
  "DEV",
  "TESTING",
];

async function seedRoles() {
  console.log("🔄 Seeding roles...");

  for (const roleName of ROLES) {
    // Check if role already exists
    const existing = await db
      .select()
      .from(roles)
      .where(eq(roles.name, roleName))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(roles).values({ name: roleName });
      console.log(`  ✅ Created role: ${roleName}`);
    } else {
      console.log(`  ⏭️  Role already exists: ${roleName}`);
    }
  }

  console.log("✅ Roles seeded successfully\n");
}

async function seedProgressStatuses() {
  console.log("🔄 Seeding progress statuses...");

  for (const statusName of PROGRESS_STATUSES) {
    // Check if status already exists
    const existing = await db
      .select()
      .from(progressStatus)
      .where(eq(progressStatus.name, statusName))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(progressStatus).values({ name: statusName });
      console.log(`  ✅ Created status: ${statusName}`);
    } else {
      console.log(`  ⏭️  Status already exists: ${statusName}`);
    }
  }

  console.log("✅ Progress statuses seeded successfully\n");
}

async function main() {
  try {
    console.log("🚀 Starting seed data script\n");

    await seedRoles();
    await seedProgressStatuses();

    console.log("🎉 All seed data inserted successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
}

main().catch((error: unknown) => {
  if (error instanceof Error) {
    console.error("❌ Error running seed script:", error.message);
  } else {
    console.error("❌ Unknown error:", error);
  }
  process.exit(1);
});
