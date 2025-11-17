/**
 * Session Management Integration Tests
 *
 * Tests the complete session lifecycle:
 * - Session creation on login/register
 * - Session validation in auth middleware
 * - Session deletion on logout
 * - Expired session handling
 */

import { createUser } from "#core/users/workflows/create-user";
import { login } from "#core/users/workflows/login";
import { session } from "#db/schema";
import {
  sessionRepository,
  userRepository,
} from "#infrastructure/repositories/drizzle";
import { run } from "#lib/result/index";
import { eq } from "drizzle-orm";
import { describe, expect, it, beforeEach } from "vitest";
import { cleanupDatabase, getTestDb } from "../helpers/database";

describe("Session Management Integration Tests", () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  describe("Session Creation", () => {
    it("should create session when user registers", async () => {
      const input = {
        email: "newuser@example.com",
        password: "SecurePassword123!",
        name: "New User",
      };

      const result = await run(createUser(input));

      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        const { token } = result.value;

        // Verify session was created in database
        const db = getTestDb();
        const sessionRecords = await db
          .select()
          .from(session)
          .where(eq(session.token, token));

        expect(sessionRecords).toHaveLength(1);
        expect(sessionRecords[0].token).toBe(token);
        expect(sessionRecords[0].userId).toBe(result.value.user.id);
        expect(sessionRecords[0].expiresAt.getTime()).toBeGreaterThan(
          Date.now(),
        );
      }
    });

    it("should create session when user logs in", async () => {
      // First create a user
      const registerInput = {
        email: "loginuser@example.com",
        password: "SecurePassword123!",
        name: "Login User",
      };
      await run(createUser(registerInput));

      // Clear session from registration
      const db = getTestDb();
      await db.delete(session);

      // Now login
      const loginInput = {
        email: "loginuser@example.com",
        password: "SecurePassword123!",
      };

      const result = await run(login(loginInput));

      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        const { token } = result.value;

        // Verify session was created in database
        const sessionRecords = await db
          .select()
          .from(session)
          .where(eq(session.token, token));

        expect(sessionRecords).toHaveLength(1);
        expect(sessionRecords[0].token).toBe(token);
      }
    });

    it("should create unique sessions for each login", async () => {
      // Create a user
      const registerInput = {
        email: "multiuser@example.com",
        password: "SecurePassword123!",
        name: "Multi User",
      };
      await run(createUser(registerInput));

      const db = getTestDb();
      await db.delete(session);

      // Login multiple times
      const loginInput = {
        email: "multiuser@example.com",
        password: "SecurePassword123!",
      };

      const result1 = await run(login(loginInput));
      const result2 = await run(login(loginInput));

      expect(result1.status).toBe("Success");
      expect(result2.status).toBe("Success");

      if (result1.status === "Success" && result2.status === "Success") {
        // Tokens should be different
        expect(result1.value.token).not.toBe(result2.value.token);

        // Both sessions should exist in database
        const allSessions = await db.select().from(session);
        expect(allSessions).toHaveLength(2);
      }
    });
  });

  describe("Session Validation", () => {
    it("should validate valid session", async () => {
      // Create user and login
      const input = {
        email: "validuser@example.com",
        password: "SecurePassword123!",
        name: "Valid User",
      };
      const result = await run(createUser(input));

      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        const { token } = result.value;

        // Validate session using repository
        const isValid = await sessionRepository.isValid(token);
        expect(isValid).toBe(true);
      }
    });

    it("should reject non-existent session", async () => {
      const fakeToken = "fake.jwt.token";

      const isValid = await sessionRepository.isValid(fakeToken);
      expect(isValid).toBe(false);
    });

    it("should reject expired session", async () => {
      // Create user and get token
      const input = {
        email: "expireduser@example.com",
        password: "SecurePassword123!",
        name: "Expired User",
      };
      const result = await run(createUser(input));

      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        const { token } = result.value;

        // Manually expire the session by updating expiresAt to past
        const db = getTestDb();
        await db
          .update(session)
          .set({ expiresAt: new Date(Date.now() - 1000) }) // 1 second ago
          .where(eq(session.token, token));

        // Validate session - should be invalid
        const isValid = await sessionRepository.isValid(token);
        expect(isValid).toBe(false);
      }
    });
  });

  describe("Session Deletion", () => {
    it("should delete session by token", async () => {
      // Create user and login
      const input = {
        email: "deleteuser@example.com",
        password: "SecurePassword123!",
        name: "Delete User",
      };
      const result = await run(createUser(input));

      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        const { token } = result.value;

        // Delete session
        const deletedSessions = await sessionRepository.deleteByToken(token);
        expect(deletedSessions).toHaveLength(1);

        // Verify session no longer exists
        const isValid = await sessionRepository.isValid(token);
        expect(isValid).toBe(false);
      }
    });

    it("should delete all sessions for a user", async () => {
      // Create user and login multiple times
      const registerInput = {
        email: "multisession@example.com",
        password: "SecurePassword123!",
        name: "Multi Session User",
      };
      const registerResult = await run(createUser(registerInput));

      expect(registerResult.status).toBe("Success");

      if (registerResult.status === "Success") {
        const userId = registerResult.value.user.id;

        // Login two more times
        const loginInput = {
          email: "multisession@example.com",
          password: "SecurePassword123!",
        };
        await run(login(loginInput));
        await run(login(loginInput));

        // Should have 3 sessions total
        const db = getTestDb();
        const allSessions = await db
          .select()
          .from(session)
          .where(eq(session.userId, userId));
        expect(allSessions).toHaveLength(3);

        // Delete all sessions for user
        const deletedSessions = await sessionRepository.deleteByUserId(userId);
        expect(deletedSessions).toHaveLength(3);

        // Verify no sessions exist
        const remainingSessions = await db
          .select()
          .from(session)
          .where(eq(session.userId, userId));
        expect(remainingSessions).toHaveLength(0);
      }
    });

    it("should delete expired sessions", async () => {
      // Create two users with sessions
      const user1 = await run(
        createUser({
          email: "user1@example.com",
          password: "Password123!",
          name: "User 1",
        }),
      );

      const user2 = await run(
        createUser({
          email: "user2@example.com",
          password: "Password123!",
          name: "User 2",
        }),
      );

      expect(user1.status).toBe("Success");
      expect(user2.status).toBe("Success");

      if (user1.status === "Success" && user2.status === "Success") {
        const token1 = user1.value.token;
        const token2 = user2.value.token;

        // Expire user1's session
        const db = getTestDb();
        await db
          .update(session)
          .set({ expiresAt: new Date(Date.now() - 1000) })
          .where(eq(session.token, token1));

        // Delete expired sessions
        const deletedSessions = await sessionRepository.deleteExpired();
        expect(deletedSessions).toHaveLength(1);

        // Verify only user1's session was deleted
        const isValid1 = await sessionRepository.isValid(token1);
        const isValid2 = await sessionRepository.isValid(token2);

        expect(isValid1).toBe(false);
        expect(isValid2).toBe(true);
      }
    });
  });

  describe("Session Cascade Deletion", () => {
    it("should delete sessions when user is deleted", async () => {
      // Create user with session
      const input = {
        email: "cascadeuser@example.com",
        password: "SecurePassword123!",
        name: "Cascade User",
      };
      const result = await run(createUser(input));

      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        const { token, user } = result.value;

        // Verify session exists
        let isValid = await sessionRepository.isValid(token);
        expect(isValid).toBe(true);

        // Delete user
        await userRepository.delete(user.id);

        // Verify session was cascade deleted
        isValid = await sessionRepository.isValid(token);
        expect(isValid).toBe(false);
      }
    });
  });
});
