/**
 * Integration Tests for Create User Workflow
 *
 * Tests the complete user creation flow with real database operations.
 * Uses PostgreSQL testcontainer for isolated, reproducible testing.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { eq } from "drizzle-orm";
import { run } from "#lib/result/index";
import { createUser } from "#core/users";
import type { CreateUserInput } from "#core/users";
import { users, portalMailInvitations } from "#db/schema";
import { cleanupDatabase, getTestDb } from "../helpers/database";
import { createTestInvitation } from "../helpers/invitation";

describe("createUser Integration Tests", () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  describe("Happy Path", () => {
    it("should create user successfully with valid input", async () => {
      // Arrange
      await createTestInvitation("test@example.com");

      const input: CreateUserInput = {
        email: "test@example.com",
        password: "securePassword123",
        name: "Test",
        surname: "User",
      };

      // Act
      const result = await run(createUser(input));

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        // Verify nested structure (best practice)
        expect(result.value).toHaveProperty("user");
        expect(result.value).toHaveProperty("token");

        // Verify user data structure
        expect(result.value.user).toMatchObject({
          email: "test@example.com",
          name: "Test",
          surname: "User",
        });

        // Verify UUID is generated
        expect(result.value.user.id).toBeDefined();
        expect(typeof result.value.user.id).toBe("string");

        // Verify authentication token is generated
        expect(result.value.token).toBeDefined();
        expect(typeof result.value.token).toBe("string");
        expect(result.value.token.length).toBeGreaterThan(0);

        // Verify user exists in database
        const db = getTestDb();
        const userRecords = await db
          .select()
          .from(users)
          .where(eq(users.email, "test@example.com"));

        expect(userRecords).toHaveLength(1);
        expect(userRecords[0].email).toBe("test@example.com");
        expect(userRecords[0].name).toBe("Test");
        expect(userRecords[0].surname).toBe("User");
        // Password should be hashed, not plain text
        expect(userRecords[0].password).not.toBe("securePassword123");
        expect(userRecords[0].password.startsWith("$2b$")).toBe(true);
      }
    });

    it("should create user successfully without optional name and surname", async () => {
      // Arrange
      await createTestInvitation("noname@example.com");

      const input: CreateUserInput = {
        email: "noname@example.com",
        password: "anotherPassword456",
      };

      // Act
      const result = await run(createUser(input));

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        expect(result.value.user.email).toBe("noname@example.com");
        expect(result.value.user.name).toBeNull();
        expect(result.value.user.surname).toBeNull();
        expect(result.value.token).toBeDefined();
      }
    });
  });

  describe("Error Paths", () => {
    it("should fail when email already exists", async () => {
      // Arrange - Create invitation and first user
      await createTestInvitation("duplicate@example.com");

      const input: CreateUserInput = {
        email: "duplicate@example.com",
        password: "password123",
      };
      await run(createUser(input));

      // Delete the ACCEPTED invitation to allow creating a new PENDING one
      const db = getTestDb();
      await db
        .delete(portalMailInvitations)
        .where(eq(portalMailInvitations.email, "duplicate@example.com"));

      // Create new PENDING invitation for second registration attempt
      await createTestInvitation("duplicate@example.com");

      // Act - Try to create user with same email
      const result = await run(createUser(input));

      // Assert
      expect(result.status).toBe("Failure");

      if (result.status === "Failure") {
        expect(result.error.code).toBe("USER_EMAIL_ALREADY_EXISTS");
        expect(result.error.message).toBe("Email already in use");
      }
    });

    it("should fail with invalid email format", async () => {
      // Arrange
      await createTestInvitation("not-an-email"); // Even with invitation, invalid email should fail

      const input: CreateUserInput = {
        email: "not-an-email",
        password: "validPassword123",
      };

      // Act
      const result = await run(createUser(input));

      // Assert
      expect(result.status).toBe("Failure");

      if (result.status === "Failure") {
        expect(result.error.code).toBe("USER_INVALID_EMAIL");
        expect(result.error.message).toBe("Invalid email format");
      }
    });

    it("should fail with password shorter than 8 characters", async () => {
      // Arrange
      await createTestInvitation("test2@example.com");

      const input: CreateUserInput = {
        email: "test2@example.com",
        password: "short",
      };

      // Act
      const result = await run(createUser(input));

      // Assert
      expect(result.status).toBe("Failure");

      if (result.status === "Failure") {
        expect(result.error.code).toBe("USER_INVALID_PASSWORD");
        expect(result.error.message).toBe(
          "Password must be at least 8 characters long",
        );
      }
    });

    it("should fail with empty email", async () => {
      // Arrange
      await createTestInvitation(""); // Even with invitation, empty email should fail

      const input: CreateUserInput = {
        email: "",
        password: "validPassword123",
      };

      // Act
      const result = await run(createUser(input));

      // Assert
      expect(result.status).toBe("Failure");

      if (result.status === "Failure") {
        expect(result.error.code).toBe("USER_INVALID_EMAIL");
      }
    });
  });

  describe("Database Integration", () => {
    it("should persist user data correctly in database", async () => {
      // Arrange
      await createTestInvitation("persist@example.com");

      const input: CreateUserInput = {
        email: "persist@example.com",
        password: "testPassword123",
        name: "Persist",
        surname: "Test",
      };

      // Act
      const result = await run(createUser(input));

      // Assert - Query database directly
      expect(result.status).toBe("Success");

      const db = getTestDb();
      const userRecords = await db
        .select()
        .from(users)
        .where(eq(users.email, "persist@example.com"));

      expect(userRecords).toHaveLength(1);
      expect(userRecords[0]).toMatchObject({
        email: "persist@example.com",
        name: "Persist",
        surname: "Test",
      });

      // Verify timestamps are set
      expect(userRecords[0].createdAt).toBeInstanceOf(Date);
      expect(userRecords[0].updatedAt).toBeInstanceOf(Date);

      // Verify password is hashed with bcrypt
      expect(userRecords[0].password).toMatch(/^\$2[aby]\$\d{2}\$/);
    });

    it("should handle multiple users with different emails", async () => {
      // Arrange - Create invitations
      await createTestInvitation("user1@example.com");
      await createTestInvitation("user2@example.com");
      await createTestInvitation("user3@example.com");

      // Act - Create multiple users
      const user1 = await run(
        createUser({
          email: "user1@example.com",
          password: "password123",
        }),
      );
      const user2 = await run(
        createUser({
          email: "user2@example.com",
          password: "password456",
        }),
      );
      const user3 = await run(
        createUser({
          email: "user3@example.com",
          password: "password789",
        }),
      );

      // Assert
      expect(user1.status).toBe("Success");
      expect(user2.status).toBe("Success");
      expect(user3.status).toBe("Success");

      // Verify all users exist in database
      const db = getTestDb();
      const allUsers = await db.select().from(users);

      expect(allUsers).toHaveLength(3);
      expect(allUsers.map((u) => u.email)).toEqual([
        "user1@example.com",
        "user2@example.com",
        "user3@example.com",
      ]);
    });
  });

  describe("Invitation Validation", () => {
    it("should fail when no invitation exists for email", async () => {
      // Arrange
      const input: CreateUserInput = {
        email: "noinvite@example.com",
        password: "securePassword123",
        name: "Test",
        surname: "User",
      };

      // Act
      const result = await run(createUser(input));

      // Assert
      expect(result.status).toBe("Failure");

      if (result.status === "Failure") {
        expect(result.error.code).toBe("USER_INVITATION_NOT_FOUND");
        expect(result.error.message).toContain(
          "No invitation found for this email address",
        );
      }
    });

    it("should fail when invitation has expired", async () => {
      // Arrange - Create expired invitation (dueDate in past)
      const db = getTestDb();
      const expiredDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago

      await db.insert(portalMailInvitations).values({
        email: "expired@example.com",
        status: "PENDING",
        dueDate: expiredDate,
      });

      const input: CreateUserInput = {
        email: "expired@example.com",
        password: "securePassword123",
        name: "Test",
        surname: "User",
      };

      // Act
      const result = await run(createUser(input));

      // Assert
      expect(result.status).toBe("Failure");

      if (result.status === "Failure") {
        expect(result.error.code).toBe("USER_INVITATION_EXPIRED");
        expect(result.error.message).toContain("invitation has expired");
      }
    });

    it("should fail when invitation has been cancelled", async () => {
      // Arrange - Create cancelled invitation
      const db = getTestDb();
      const futureDate = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours from now

      await db.insert(portalMailInvitations).values({
        email: "cancelled@example.com",
        status: "CANCELLED",
        dueDate: futureDate,
      });

      const input: CreateUserInput = {
        email: "cancelled@example.com",
        password: "securePassword123",
        name: "Test",
        surname: "User",
      };

      // Act
      const result = await run(createUser(input));

      // Assert
      expect(result.status).toBe("Failure");

      if (result.status === "Failure") {
        expect(result.error.code).toBe("USER_INVITATION_CANCELLED");
        expect(result.error.message).toContain("invitation has been cancelled");
      }
    });

    it("should succeed with valid invitation and mark it as ACCEPTED", async () => {
      // Arrange - Create valid invitation
      const db = getTestDb();
      const futureDate = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours from now

      await db.insert(portalMailInvitations).values({
        email: "invited@example.com",
        status: "PENDING",
        dueDate: futureDate,
      });

      const input: CreateUserInput = {
        email: "invited@example.com",
        password: "securePassword123",
        name: "Invited",
        surname: "User",
      };

      // Act
      const result = await run(createUser(input));

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        // Verify user was created
        expect(result.value.user.email).toBe("invited@example.com");
        expect(result.value.user.name).toBe("Invited");
        expect(result.value.token).toBeDefined();

        // Verify invitation status was updated to ACCEPTED
        const invitationRecords = await db
          .select()
          .from(portalMailInvitations)
          .where(eq(portalMailInvitations.email, "invited@example.com"));

        expect(invitationRecords).toHaveLength(1);
        expect(invitationRecords[0].status).toBe("ACCEPTED");

        // Verify user exists in database
        const userRecords = await db
          .select()
          .from(users)
          .where(eq(users.email, "invited@example.com"));

        expect(userRecords).toHaveLength(1);
        expect(userRecords[0].email).toBe("invited@example.com");
      }
    });

    it("should prevent registration with already accepted invitation", async () => {
      // Arrange - Create accepted invitation
      const db = getTestDb();
      const futureDate = new Date(Date.now() + 48 * 60 * 60 * 1000);

      await db.insert(portalMailInvitations).values({
        email: "accepted@example.com",
        status: "ACCEPTED",
        dueDate: futureDate,
      });

      const input: CreateUserInput = {
        email: "accepted@example.com",
        password: "securePassword123",
        name: "Test",
        surname: "User",
      };

      // Act
      const result = await run(createUser(input));

      // Assert
      expect(result.status).toBe("Failure");

      if (result.status === "Failure") {
        expect(result.error.code).toBe("USER_INVITATION_NOT_FOUND");
        expect(result.error.message).toContain("no longer valid");
      }
    });

    it("should handle invitation expiring exactly at current time", async () => {
      // Arrange - Create invitation expiring now
      const db = getTestDb();
      const now = new Date();

      await db.insert(portalMailInvitations).values({
        email: "justnow@example.com",
        status: "PENDING",
        dueDate: now,
      });

      const input: CreateUserInput = {
        email: "justnow@example.com",
        password: "securePassword123",
        name: "Test",
        surname: "User",
      };

      // Act - Wait a tiny bit to ensure time has passed
      await new Promise((resolve) => setTimeout(resolve, 10));
      const result = await run(createUser(input));

      // Assert - Should fail as expired
      expect(result.status).toBe("Failure");

      if (result.status === "Failure") {
        expect(result.error.code).toBe("USER_INVITATION_EXPIRED");
      }
    });

    it("should validate invitation before checking email availability", async () => {
      // Arrange - Create a user WITHOUT invitation
      const db = getTestDb();
      const futureDate = new Date(Date.now() + 48 * 60 * 60 * 1000);

      // Create invitation for user1
      await db.insert(portalMailInvitations).values({
        email: "user1@example.com",
        status: "PENDING",
        dueDate: futureDate,
      });

      // Create user1
      await run(
        createUser({
          email: "user1@example.com",
          password: "password123",
        }),
      );

      // Act - Try to create user2 without invitation
      const result = await run(
        createUser({
          email: "user2@example.com",
          password: "password456",
        }),
      );

      // Assert - Should fail with invitation error, not email exists error
      expect(result.status).toBe("Failure");

      if (result.status === "Failure") {
        expect(result.error.code).toBe("USER_INVITATION_NOT_FOUND");
        // Should NOT be USER_EMAIL_ALREADY_EXISTS
      }
    });
  });
});
