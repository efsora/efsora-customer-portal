/**
 * Integration Tests for User Profile Operations
 *
 * Tests user profile and password update workflows with real database operations.
 * Uses PostgreSQL testcontainer for isolated, reproducible testing.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { eq } from "drizzle-orm";
import { run } from "#lib/result/index";
import { updateUserProfile, updateUserPassword } from "#core/users";
import type {
  UpdateProfileInput,
  UpdatePasswordInput,
  CreateUserInput,
} from "#core/users";
import { users } from "#db/schema";
import { cleanupDatabase, getTestDb } from "../helpers/database";
import { createTestUser } from "../helpers/invitation";
import bcrypt from "bcrypt";

describe("User Profile Integration Tests", () => {
  let testUserId: string;
  const testPassword = "password123";

  beforeEach(async () => {
    await cleanupDatabase();

    // Create test user
    const userInput: CreateUserInput = {
      email: "profile.test@example.com",
      password: testPassword,
      name: "Profile Test",
    };
    const userResult = await createTestUser(userInput);
    if (userResult.status === "Success") {
      testUserId = userResult.value.user.id;
    }
  });

  describe("Update User Profile", () => {
    it("should update profile with all fields successfully", async () => {
      // Arrange
      const input: UpdateProfileInput = {
        userId: testUserId,
        name: "Updated Name",
        surname: "Updated Surname",
        bio: "This is my updated bio with lots of information about me.",
      };

      // Act
      const result = await run(updateUserProfile(input));

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        expect(result.value.id).toBe(testUserId);
        expect(result.value.name).toBe("Updated Name");
        expect(result.value.surname).toBe("Updated Surname");
        expect(result.value.bio).toBe(
          "This is my updated bio with lots of information about me.",
        );
        expect(result.value.email).toBe("profile.test@example.com");

        // Verify in database
        const db = getTestDb();
        const userRecords = await db
          .select()
          .from(users)
          .where(eq(users.id, testUserId));

        expect(userRecords).toHaveLength(1);
        expect(userRecords[0].name).toBe("Updated Name");
        expect(userRecords[0].surname).toBe("Updated Surname");
        expect(userRecords[0].bio).toBe(
          "This is my updated bio with lots of information about me.",
        );
      }
    });

    it("should update profile with partial fields (name only)", async () => {
      // Arrange
      const input: UpdateProfileInput = {
        userId: testUserId,
        name: "Only Name Updated",
      };

      // Act
      const result = await run(updateUserProfile(input));

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        expect(result.value.name).toBe("Only Name Updated");
        expect(result.value.surname).toBeNull();
        expect(result.value.bio).toBeNull();

        // Verify in database
        const db = getTestDb();
        const userRecords = await db
          .select()
          .from(users)
          .where(eq(users.id, testUserId));

        expect(userRecords[0].name).toBe("Only Name Updated");
        expect(userRecords[0].surname).toBeNull();
      }
    });

    it("should update profile with partial fields (surname only)", async () => {
      // Arrange
      const input: UpdateProfileInput = {
        userId: testUserId,
        surname: "Only Surname",
      };

      // Act
      const result = await run(updateUserProfile(input));

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        expect(result.value.surname).toBe("Only Surname");

        // Verify in database
        const db = getTestDb();
        const userRecords = await db
          .select()
          .from(users)
          .where(eq(users.id, testUserId));

        expect(userRecords[0].surname).toBe("Only Surname");
      }
    });

    it("should update profile with partial fields (bio only)", async () => {
      // Arrange
      const input: UpdateProfileInput = {
        userId: testUserId,
        bio: "Just updating my bio here.",
      };

      // Act
      const result = await run(updateUserProfile(input));

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        expect(result.value.bio).toBe("Just updating my bio here.");

        // Verify in database
        const db = getTestDb();
        const userRecords = await db
          .select()
          .from(users)
          .where(eq(users.id, testUserId));

        expect(userRecords[0].bio).toBe("Just updating my bio here.");
      }
    });

    it("should update profile multiple times", async () => {
      // First update
      await run(
        updateUserProfile({
          userId: testUserId,
          name: "First Update",
          surname: "First Surname",
        }),
      );

      // Second update
      const result = await run(
        updateUserProfile({
          userId: testUserId,
          name: "Second Update",
          bio: "Second bio",
        }),
      );

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        expect(result.value.name).toBe("Second Update");
        expect(result.value.bio).toBe("Second bio");

        // Verify in database
        const db = getTestDb();
        const userRecords = await db
          .select()
          .from(users)
          .where(eq(users.id, testUserId));

        expect(userRecords[0].name).toBe("Second Update");
        expect(userRecords[0].bio).toBe("Second bio");
      }
    });

    it("should fail when user does not exist", async () => {
      // Arrange
      const input: UpdateProfileInput = {
        userId: "00000000-0000-0000-0000-000000000000",
        name: "Ghost User",
      };

      // Act
      const result = await run(updateUserProfile(input));

      // Assert
      expect(result.status).toBe("Failure");

      if (result.status === "Failure") {
        expect(result.error.code).toBe("USER_NOT_FOUND");
        expect(result.error.message).toContain("User not found");
      }
    });

    it("should preserve email and timestamps", async () => {
      // Arrange
      const input: UpdateProfileInput = {
        userId: testUserId,
        name: "Updated",
      };

      // Get original timestamps
      const db = getTestDb();
      const originalUser = await db
        .select()
        .from(users)
        .where(eq(users.id, testUserId));
      const originalCreatedAt = originalUser[0].createdAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Act
      const result = await run(updateUserProfile(input));

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        // Email should not change
        expect(result.value.email).toBe("profile.test@example.com");

        // CreatedAt should not change
        expect(result.value.createdAt).toEqual(originalCreatedAt);

        // UpdatedAt should be newer
        expect(result.value.updatedAt.getTime()).toBeGreaterThan(
          originalCreatedAt.getTime(),
        );
      }
    });
  });

  describe("Update User Password", () => {
    it("should update password successfully with valid current password", async () => {
      // Arrange
      const input: UpdatePasswordInput = {
        userId: testUserId,
        currentPassword: testPassword,
        newPassword: "newPassword456",
      };

      // Act
      const result = await run(updateUserPassword(input));

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        expect(result.value.id).toBe(testUserId);

        // Verify password was changed in database
        const db = getTestDb();
        const userRecords = await db
          .select()
          .from(users)
          .where(eq(users.id, testUserId));

        expect(userRecords).toHaveLength(1);

        // Verify new password hash is different from old one
        const newPasswordHash = userRecords[0].password;
        expect(newPasswordHash).toBeDefined();

        // Verify new password works
        const isNewPasswordValid = await bcrypt.compare(
          "newPassword456",
          newPasswordHash,
        );
        expect(isNewPasswordValid).toBe(true);

        // Verify old password no longer works
        const isOldPasswordValid = await bcrypt.compare(
          testPassword,
          newPasswordHash,
        );
        expect(isOldPasswordValid).toBe(false);
      }
    });

    it("should fail with incorrect current password", async () => {
      // Arrange
      const input: UpdatePasswordInput = {
        userId: testUserId,
        currentPassword: "wrongPassword",
        newPassword: "newPassword456",
      };

      // Act
      const result = await run(updateUserPassword(input));

      // Assert
      expect(result.status).toBe("Failure");

      if (result.status === "Failure") {
        expect(result.error.code).toBe("USER_CURRENT_PASSWORD_INVALID");
        expect(result.error.message).toContain("Current password is incorrect");

        // Verify password was NOT changed in database
        const db = getTestDb();
        const userRecords = await db
          .select()
          .from(users)
          .where(eq(users.id, testUserId));

        // Old password should still work
        const isOldPasswordValid = await bcrypt.compare(
          testPassword,
          userRecords[0].password,
        );
        expect(isOldPasswordValid).toBe(true);
      }
    });

    it("should fail when new password is too short", async () => {
      // Arrange
      const input: UpdatePasswordInput = {
        userId: testUserId,
        currentPassword: testPassword,
        newPassword: "short",
      };

      // Act
      const result = await run(updateUserPassword(input));

      // Assert
      expect(result.status).toBe("Failure");

      if (result.status === "Failure") {
        expect(result.error.code).toBe("USER_INVALID_PASSWORD");
        expect(result.error.message).toContain("at least 8 characters");

        // Verify password was NOT changed
        const db = getTestDb();
        const userRecords = await db
          .select()
          .from(users)
          .where(eq(users.id, testUserId));

        const isOldPasswordValid = await bcrypt.compare(
          testPassword,
          userRecords[0].password,
        );
        expect(isOldPasswordValid).toBe(true);
      }
    });

    it("should fail when new password is empty", async () => {
      // Arrange
      const input: UpdatePasswordInput = {
        userId: testUserId,
        currentPassword: testPassword,
        newPassword: "",
      };

      // Act
      const result = await run(updateUserPassword(input));

      // Assert
      expect(result.status).toBe("Failure");

      if (result.status === "Failure") {
        expect(result.error.code).toBe("USER_INVALID_PASSWORD");
      }
    });

    it("should fail when user does not exist", async () => {
      // Arrange
      const input: UpdatePasswordInput = {
        userId: "00000000-0000-0000-0000-000000000000",
        currentPassword: "anyPassword",
        newPassword: "newPassword123",
      };

      // Act
      const result = await run(updateUserPassword(input));

      // Assert
      expect(result.status).toBe("Failure");

      if (result.status === "Failure") {
        expect(result.error.code).toBe("USER_NOT_FOUND");
        expect(result.error.message).toContain("User not found");
      }
    });

    it("should allow updating password multiple times", async () => {
      // First password update
      const firstUpdate = await run(
        updateUserPassword({
          userId: testUserId,
          currentPassword: testPassword,
          newPassword: "firstNewPassword",
        }),
      );
      expect(firstUpdate.status).toBe("Success");

      // Second password update
      const secondUpdate = await run(
        updateUserPassword({
          userId: testUserId,
          currentPassword: "firstNewPassword",
          newPassword: "secondNewPassword",
        }),
      );
      expect(secondUpdate.status).toBe("Success");

      // Verify final password
      const db = getTestDb();
      const userRecords = await db
        .select()
        .from(users)
        .where(eq(users.id, testUserId));

      const isFinalPasswordValid = await bcrypt.compare(
        "secondNewPassword",
        userRecords[0].password,
      );
      expect(isFinalPasswordValid).toBe(true);

      // Verify intermediate password no longer works
      const isIntermediatePasswordValid = await bcrypt.compare(
        "firstNewPassword",
        userRecords[0].password,
      );
      expect(isIntermediatePasswordValid).toBe(false);

      // Verify original password no longer works
      const isOriginalPasswordValid = await bcrypt.compare(
        testPassword,
        userRecords[0].password,
      );
      expect(isOriginalPasswordValid).toBe(false);
    });

    it("should update updatedAt timestamp when password changes", async () => {
      // Get original timestamp
      const db = getTestDb();
      const originalUser = await db
        .select()
        .from(users)
        .where(eq(users.id, testUserId));
      const originalUpdatedAt = originalUser[0].updatedAt;

      // Wait to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Update password
      const result = await run(
        updateUserPassword({
          userId: testUserId,
          currentPassword: testPassword,
          newPassword: "brandNewPassword",
        }),
      );

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        expect(result.value.updatedAt.getTime()).toBeGreaterThan(
          originalUpdatedAt.getTime(),
        );
      }
    });

    it("should accept valid 8-character password", async () => {
      // Arrange - Exactly 8 characters
      const input: UpdatePasswordInput = {
        userId: testUserId,
        currentPassword: testPassword,
        newPassword: "12345678",
      };

      // Act
      const result = await run(updateUserPassword(input));

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        const db = getTestDb();
        const userRecords = await db
          .select()
          .from(users)
          .where(eq(users.id, testUserId));

        const isNewPasswordValid = await bcrypt.compare(
          "12345678",
          userRecords[0].password,
        );
        expect(isNewPasswordValid).toBe(true);
      }
    });
  });

  describe("Combined Profile and Password Updates", () => {
    it("should allow updating profile and password independently", async () => {
      // Update profile
      const profileResult = await run(
        updateUserProfile({
          userId: testUserId,
          name: "Updated Profile Name",
          bio: "New bio",
        }),
      );
      expect(profileResult.status).toBe("Success");

      // Update password
      const passwordResult = await run(
        updateUserPassword({
          userId: testUserId,
          currentPassword: testPassword,
          newPassword: "brandNewPassword",
        }),
      );
      expect(passwordResult.status).toBe("Success");

      // Verify both updates in database
      const db = getTestDb();
      const userRecords = await db
        .select()
        .from(users)
        .where(eq(users.id, testUserId));

      expect(userRecords[0].name).toBe("Updated Profile Name");
      expect(userRecords[0].bio).toBe("New bio");

      const isNewPasswordValid = await bcrypt.compare(
        "brandNewPassword",
        userRecords[0].password,
      );
      expect(isNewPasswordValid).toBe(true);
    });

    it("should return extended user data with all profile fields", async () => {
      // Update profile with all fields
      await run(
        updateUserProfile({
          userId: testUserId,
          name: "Complete Name",
          surname: "Complete Surname",
          bio: "Complete bio information",
        }),
      );

      // Update password
      const result = await run(
        updateUserPassword({
          userId: testUserId,
          currentPassword: testPassword,
          newPassword: "newPassword123",
        }),
      );

      // Assert - Should return extended user data
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        expect(result.value).toMatchObject({
          id: testUserId,
          email: "profile.test@example.com",
          name: "Complete Name",
          surname: "Complete Surname",
          bio: "Complete bio information",
          companyId: null,
          projectId: null,
          roleId: null,
        });
        expect(result.value.createdAt).toBeInstanceOf(Date);
        expect(result.value.updatedAt).toBeInstanceOf(Date);
      }
    });
  });
});
