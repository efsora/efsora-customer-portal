/**
 * Global test setup and utilities
 * Automatically imported by vitest through setupFiles config
 */

import { beforeAll, afterAll } from "vitest";
import { setupTestDatabase, teardownTestDatabase } from "../helpers/database";

// Setup testcontainer before all tests
beforeAll(async () => {
  await setupTestDatabase();
}, 60000); // 60 second timeout for container startup

// Teardown testcontainer after all tests
afterAll(async () => {
  await teardownTestDatabase();
});
