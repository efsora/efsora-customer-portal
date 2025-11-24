/**
 * Vitest Setup File
 *
 * This file runs before each test file (after global setup).
 * Sets up test environment variables required by the application.
 * Note: DATABASE_URL is set by global-setup.ts, not here.
 */

// Set required environment variables for tests
process.env.NODE_ENV = "development";
process.env.JWT_SECRET =
  "test-secret-key-minimum-32-chars-long-for-jwt-signing";
process.env.OTEL_SERVICE_NAME = "backend-test";
process.env.LOG_LEVEL = "error"; // Reduce log noise in tests
process.env.ENABLE_TRACING = "false"; // Disable tracing in tests
process.env.METRICS_ENABLED = "false"; // Disable metrics in tests
process.env.PORT = "3000"; // Required by config

// AWS S3 Configuration (mock values for testing)
process.env.AWS_ACCESS_KEY_ID = "test-access-key-id";
process.env.AWS_SECRET_ACCESS_KEY = "test-secret-access-key";
process.env.AWS_S3_BUCKET = "test-bucket";
process.env.AWS_S3_REGION = "us-east-1";

// DATABASE_URL is set by global-setup.ts before any modules load

// Log setup completion (only in verbose mode)
if (process.env.VERBOSE_TESTS) {
  console.log("✓ Test environment variables configured");
}
