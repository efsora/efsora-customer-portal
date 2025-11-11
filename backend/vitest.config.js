import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Only include TypeScript test files from source
    include: ["tests/**/*.test.ts", "src/**/*.test.ts"],
    // Exclude compiled dist folder and node_modules
    exclude: ["node_modules", "dist", "dist/**/*"],
    // Use Node.js as test environment
    environment: "node",
    // Run tests sequentially to avoid database deadlocks
    // Integration tests share a single database and TRUNCATE operations can deadlock
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true, // Run all tests in a single process sequentially
      },
    },
    // Force sequential test execution (no parallelism)
    // This ensures database operations don't conflict
    fileParallelism: false,
    sequence: {
      concurrent: false, // Run test files one by one
      shuffle: false, // Keep test order predictable
    },
    // Increase timeout for integration tests with database operations
    testTimeout: 10000, // 10 seconds per test
    hookTimeout: 10000, // 10 seconds for beforeEach/afterEach
    // Global setup (runs once before all tests)
    globalSetup: ["./tests/global-setup.ts"],
    // Setup files to run before each test file
    setupFiles: ["./tests/setup.ts"],
    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/core/**/*.ts"],
      exclude: ["src/core/**/*.test.ts"],
      thresholds: {
        lines: 35,
        functions: 35,
        branches: 35,
        statements: 35,
        autoUpdate: false,
      },
      all: false,
    },
  },
});
