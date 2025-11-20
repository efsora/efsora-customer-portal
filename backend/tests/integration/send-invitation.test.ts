/**
 * Integration Tests for Send Invitation Workflow
 *
 * Tests the complete invitation sending flow with real database operations.
 * Uses PostgreSQL testcontainer for isolated, reproducible testing.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { eq } from "drizzle-orm";
import { run } from "#lib/result/index";
import { sendInvitation } from "#core/users";
import type { SendInvitationInput } from "#core/users";
import { portalMailInvitations } from "#db/schema";
import { cleanupDatabase, getTestDb } from "../helpers/database";

describe("sendInvitation Integration Tests", () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  describe("Happy Path", () => {
    it("should create invitation successfully with valid email", async () => {
      // Arrange
      const input: SendInvitationInput = {
        email: "newuser@example.com",
      };

      // Act
      const result = await run(sendInvitation(input));

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        expect(result.value.email).toBe("newuser@example.com");
        expect(result.value.status).toBe("PENDING");
        expect(result.value.message).toContain("Invitation sent successfully");
        expect(result.value.dueDate).toBeInstanceOf(Date);
        expect(result.value.dueDate.getTime()).toBeGreaterThan(Date.now());

        // Verify invitation exists in database
        const db = getTestDb();
        const invitations = await db
          .select()
          .from(portalMailInvitations)
          .where(eq(portalMailInvitations.email, "newuser@example.com"));

        expect(invitations).toHaveLength(1);
        expect(invitations[0].email).toBe("newuser@example.com");
        expect(invitations[0].status).toBe("PENDING");
      }
    });

    it("should create invitation with 48-hour expiration", async () => {
      // Arrange
      const input: SendInvitationInput = {
        email: "test@example.com",
      };

      // Act
      const result = await run(sendInvitation(input));

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        const dueDate = result.value.dueDate;
        const now = new Date();
        const expectedExpiry = new Date(now.getTime() + 48 * 60 * 60 * 1000);

        // Allow 1 second tolerance for test execution time
        const diff = Math.abs(dueDate.getTime() - expectedExpiry.getTime());
        expect(diff).toBeLessThan(1000);
      }
    });
  });

  describe("Error Paths", () => {
    it("should fail with invalid email format", async () => {
      // Arrange
      const input: SendInvitationInput = {
        email: "not-an-email",
      };

      // Act
      const result = await run(sendInvitation(input));

      // Assert
      expect(result.status).toBe("Failure");

      if (result.status === "Failure") {
        expect(result.error.code).toBe("USER_INVALID_EMAIL");
        expect(result.error.message).toBe("Invalid email format");
      }
    });

    it("should fail with empty email", async () => {
      // Arrange
      const input: SendInvitationInput = {
        email: "",
      };

      // Act
      const result = await run(sendInvitation(input));

      // Assert
      expect(result.status).toBe("Failure");

      if (result.status === "Failure") {
        expect(result.error.code).toBe("USER_INVALID_EMAIL");
      }
    });

    it("should fail when active invitation already exists", async () => {
      // Arrange - Create first invitation
      const input: SendInvitationInput = {
        email: "duplicate@example.com",
      };
      await run(sendInvitation(input));

      // Act - Try to create second invitation for same email
      const result = await run(sendInvitation(input));

      // Assert
      expect(result.status).toBe("Failure");

      if (result.status === "Failure") {
        expect(result.error.code).toBe("USER_INVITATION_ALREADY_EXISTS");
        expect(result.error.message).toContain(
          "An active invitation already exists",
        );
      }
    });
  });

  describe("Invitation Reuse", () => {
    it("should allow creating new invitation after previous one expired", async () => {
      // Arrange - Create invitation and manually expire it
      const input: SendInvitationInput = {
        email: "expired@example.com",
      };
      await run(sendInvitation(input));

      const db = getTestDb();
      await db
        .update(portalMailInvitations)
        .set({ dueDate: new Date(Date.now() - 1000) }) // 1 second ago
        .where(eq(portalMailInvitations.email, "expired@example.com"));

      // Act - Try to create new invitation
      const result = await run(sendInvitation(input));

      // Assert - Should succeed
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        expect(result.value.email).toBe("expired@example.com");
        expect(result.value.status).toBe("PENDING");
      }
    });

    it("should allow creating new invitation after previous one was accepted", async () => {
      // Arrange - Create invitation and mark as ACCEPTED
      const input: SendInvitationInput = {
        email: "accepted@example.com",
      };
      await run(sendInvitation(input));

      const db = getTestDb();
      await db
        .update(portalMailInvitations)
        .set({ status: "ACCEPTED" })
        .where(eq(portalMailInvitations.email, "accepted@example.com"));

      // Act - Try to create new invitation
      const result = await run(sendInvitation(input));

      // Assert - Should succeed
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        expect(result.value.email).toBe("accepted@example.com");
        expect(result.value.status).toBe("PENDING");
      }
    });

    it("should allow creating new invitation after previous one was cancelled", async () => {
      // Arrange - Create invitation and mark as CANCELLED
      const input: SendInvitationInput = {
        email: "cancelled@example.com",
      };
      await run(sendInvitation(input));

      const db = getTestDb();
      await db
        .update(portalMailInvitations)
        .set({ status: "CANCELLED" })
        .where(eq(portalMailInvitations.email, "cancelled@example.com"));

      // Act - Try to create new invitation
      const result = await run(sendInvitation(input));

      // Assert - Should succeed
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        expect(result.value.email).toBe("cancelled@example.com");
        expect(result.value.status).toBe("PENDING");
      }
    });
  });

  describe("Database Integration", () => {
    it("should persist invitation data correctly in database", async () => {
      // Arrange
      const input: SendInvitationInput = {
        email: "persist@example.com",
      };

      // Act
      const result = await run(sendInvitation(input));

      // Assert - Query database directly
      expect(result.status).toBe("Success");

      const db = getTestDb();
      const invitations = await db
        .select()
        .from(portalMailInvitations)
        .where(eq(portalMailInvitations.email, "persist@example.com"));

      expect(invitations).toHaveLength(1);
      expect(invitations[0]).toMatchObject({
        email: "persist@example.com",
        status: "PENDING",
      });

      // Verify timestamps are set
      expect(invitations[0].createdAt).toBeInstanceOf(Date);
      expect(invitations[0].updatedAt).toBeInstanceOf(Date);
      expect(invitations[0].dueDate).toBeInstanceOf(Date);
    });

    it("should handle multiple invitations to different emails", async () => {
      // Arrange & Act - Create multiple invitations
      const result1 = await run(
        sendInvitation({
          email: "user1@example.com",
        }),
      );
      const result2 = await run(
        sendInvitation({
          email: "user2@example.com",
        }),
      );
      const result3 = await run(
        sendInvitation({
          email: "user3@example.com",
        }),
      );

      // Assert
      expect(result1.status).toBe("Success");
      expect(result2.status).toBe("Success");
      expect(result3.status).toBe("Success");

      // Verify all invitations exist in database
      const db = getTestDb();
      const allInvitations = await db.select().from(portalMailInvitations);

      expect(allInvitations).toHaveLength(3);
      expect(allInvitations.map((inv) => inv.email)).toEqual([
        "user1@example.com",
        "user2@example.com",
        "user3@example.com",
      ]);
    });
  });
});
