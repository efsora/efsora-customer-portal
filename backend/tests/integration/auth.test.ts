import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import {
  setupTestDatabase,
  createTestDb,
  cleanupDatabase,
  teardownTestDatabase,
  getTestDb,
} from "../helpers/database";
import { run } from "#lib/result/index";
import { login, createUser } from "#core/users/index";

describe("Auth Workflows", () => {
  // Setup: Start container and run migrations (once for all tests)
  beforeAll(async () => {
    const connectionString = await setupTestDatabase();
    createTestDb(connectionString);
  }, 60000); // 60s timeout for container startup

  // Cleanup: Truncate tables before each test for isolation
  beforeEach(async () => {
    const db = getTestDb();
    await cleanupDatabase(db);
  });

  // Teardown: Stop container after all tests
  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe("login workflow", () => {
    it("should login successfully with valid credentials", async () => {
      // First, register a user
      const registerInput = {
        email: "test@example.com",
        password: "SecurePass123",
        name: "Test User",
      };

      const registerResult = await run(createUser(registerInput));
      expect(registerResult.status).toBe("Success");

      // Now login with the same credentials
      const loginInput = {
        email: "test@example.com",
        password: "SecurePass123",
      };

      const loginResult = await run(login(loginInput));

      expect(loginResult.status).toBe("Success");
      if (loginResult.status === "Success") {
        expect(loginResult.value.user.email).toBe("test@example.com");
        expect(loginResult.value.user.name).toBe("Test User");
        expect(loginResult.value.token).toBeDefined();
        expect(typeof loginResult.value.token).toBe("string");
        expect(loginResult.value.token.length).toBeGreaterThan(0);
      }
    });

    it("should fail with non-existent email", async () => {
      const loginInput = {
        email: "nonexistent@example.com",
        password: "SomePassword123",
      };

      const loginResult = await run(login(loginInput));

      expect(loginResult.status).toBe("Failure");
      if (loginResult.status === "Failure") {
        expect(loginResult.error.code).toBe("USER_INVALID_CREDENTIALS");
        expect(loginResult.error.message).toBe("Invalid email or password");
      }
    });

    it("should fail with incorrect password", async () => {
      // First, register a user
      const registerInput = {
        email: "test@example.com",
        password: "SecurePass123",
        name: "Test User",
      };

      await run(createUser(registerInput));

      // Try to login with wrong password
      const loginInput = {
        email: "test@example.com",
        password: "WrongPassword123",
      };

      const loginResult = await run(login(loginInput));

      expect(loginResult.status).toBe("Failure");
      if (loginResult.status === "Failure") {
        expect(loginResult.error.code).toBe("USER_INVALID_CREDENTIALS");
        expect(loginResult.error.message).toBe("Invalid email or password");
      }
    });

    it("should fail with invalid email format", async () => {
      const loginInput = {
        email: "not-an-email",
        password: "SomePassword123",
      };

      const loginResult = await run(login(loginInput));

      expect(loginResult.status).toBe("Failure");
      if (loginResult.status === "Failure") {
        expect(loginResult.error.code).toBe("USER_INVALID_EMAIL");
      }
    });

    it("should return token with user data", async () => {
      // Register a user
      const registerInput = {
        email: "user@example.com",
        password: "TestPassword123",
        name: "Example User",
      };

      await run(createUser(registerInput));

      // Login
      const loginResult = await run(
        login({
          email: "user@example.com",
          password: "TestPassword123",
        }),
      );

      expect(loginResult.status).toBe("Success");
      if (loginResult.status === "Success") {
        const { user, token } = loginResult.value;

        // Verify user data is complete
        expect(user).toHaveProperty("id");
        expect(user).toHaveProperty("email");
        expect(user).toHaveProperty("name");
        expect(user).toHaveProperty("createdAt");
        expect(user).toHaveProperty("updatedAt");

        // Verify token is JWT-like (contains dots)
        expect(token).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
      }
    });
  });
});
