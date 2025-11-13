/**
 * Integration Tests for Milestones Module
 *
 * Tests the complete milestone CRUD workflows with real database operations.
 * Uses PostgreSQL testcontainer for isolated, reproducible testing.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { eq } from "drizzle-orm";
import { run } from "#lib/result/index";
import {
  createMilestone,
  getMilestoneById,
  getAllMilestones,
  updateMilestone,
  deleteMilestone,
} from "#core/milestones";
import type {
  CreateMilestoneInput,
  UpdateMilestoneInput,
} from "#core/milestones";
import { milestones } from "#db/schema";
import { cleanupDatabase, getTestDb } from "../helpers/database";

describe("Milestones Module Integration Tests", () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  describe("Create Milestone", () => {
    it("should create milestone successfully with all fields", async () => {
      // Arrange
      const input: CreateMilestoneInput = {
        projectId: 1,
        assigneeUserId: "550e8400-e29b-41d4-a716-446655440000",
        dueDate: new Date("2025-03-01T00:00:00Z"),
        description: "Complete initial design phase",
      };

      // Act
      const result = await run(createMilestone(input));

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        expect(result.value).toMatchObject({
          projectId: 1,
          assigneeUserId: "550e8400-e29b-41d4-a716-446655440000",
          description: "Complete initial design phase",
        });
        expect(result.value.id).toBeDefined();
        expect(typeof result.value.id).toBe("number");
        expect(result.value.dueDate).toBeInstanceOf(Date);
        expect(result.value.createdAt).toBeInstanceOf(Date);
        expect(result.value.updatedAt).toBeInstanceOf(Date);

        // Verify in database
        const db = getTestDb();
        const milestoneRecords = await db
          .select()
          .from(milestones)
          .where(eq(milestones.id, result.value.id));

        expect(milestoneRecords).toHaveLength(1);
        expect(milestoneRecords[0].description).toBe(
          "Complete initial design phase",
        );
        expect(milestoneRecords[0].projectId).toBe(1);
      }
    });

    it("should create milestone with minimal fields (all optional)", async () => {
      // Arrange
      const input: CreateMilestoneInput = {};

      // Act
      const result = await run(createMilestone(input));

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        expect(result.value.projectId).toBeNull();
        expect(result.value.assigneeUserId).toBeNull();
        expect(result.value.dueDate).toBeNull();
        expect(result.value.description).toBeNull();
        expect(result.value.id).toBeDefined();
      }
    });

    it("should create milestone with only project ID", async () => {
      // Arrange
      const input: CreateMilestoneInput = {
        projectId: 5,
      };

      // Act
      const result = await run(createMilestone(input));

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        expect(result.value.projectId).toBe(5);
        expect(result.value.assigneeUserId).toBeNull();
        expect(result.value.dueDate).toBeNull();
        expect(result.value.description).toBeNull();
      }
    });

    it("should create milestone with only assignee", async () => {
      // Arrange
      const input: CreateMilestoneInput = {
        assigneeUserId: "123e4567-e89b-12d3-a456-426614174000",
        description: "Assigned milestone",
      };

      // Act
      const result = await run(createMilestone(input));

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        expect(result.value.assigneeUserId).toBe(
          "123e4567-e89b-12d3-a456-426614174000",
        );
        expect(result.value.description).toBe("Assigned milestone");
      }
    });

    it("should create milestone with due date", async () => {
      // Arrange
      const dueDate = new Date("2025-12-31T23:59:59Z");
      const input: CreateMilestoneInput = {
        dueDate,
        description: "Year-end milestone",
      };

      // Act
      const result = await run(createMilestone(input));

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        expect(result.value.dueDate).toBeInstanceOf(Date);
        expect(result.value.dueDate?.toISOString()).toBe(dueDate.toISOString());
      }
    });
  });

  describe("Get Milestone", () => {
    it("should retrieve milestone by ID successfully", async () => {
      // Arrange - Create a milestone
      const createResult = await run(
        createMilestone({
          projectId: 10,
          assigneeUserId: "550e8400-e29b-41d4-a716-446655440000",
          dueDate: new Date("2025-06-15T00:00:00Z"),
          description: "Test milestone",
        }),
      );

      expect(createResult.status).toBe("Success");
      if (createResult.status !== "Success") return;

      const milestoneId = createResult.value.id;

      // Act
      const result = await run(getMilestoneById({ id: milestoneId }));

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        expect(result.value).toMatchObject({
          id: milestoneId,
          projectId: 10,
          assigneeUserId: "550e8400-e29b-41d4-a716-446655440000",
          description: "Test milestone",
        });
        expect(result.value.dueDate).toBeInstanceOf(Date);
      }
    });

    it("should fail when milestone ID does not exist", async () => {
      // Act
      const result = await run(getMilestoneById({ id: 99999 }));

      // Assert
      expect(result.status).toBe("Failure");

      if (result.status === "Failure") {
        expect(result.error.code).toBe("NOT_FOUND");
        expect(result.error.message).toContain("not found");
      }
    });

    it("should retrieve all milestones", async () => {
      // Arrange - Create multiple milestones
      await run(
        createMilestone({
          projectId: 1,
          description: "Milestone 1",
        }),
      );
      await run(
        createMilestone({
          projectId: 2,
          description: "Milestone 2",
        }),
      );
      await run(
        createMilestone({
          projectId: 3,
          description: "Milestone 3",
        }),
      );

      // Act
      const result = await run(getAllMilestones());

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        expect(result.value).toHaveLength(3);
        expect(result.value.map((m) => m.description)).toEqual([
          "Milestone 1",
          "Milestone 2",
          "Milestone 3",
        ]);
      }
    });

    it("should return empty array when no milestones exist", async () => {
      // Act
      const result = await run(getAllMilestones());

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        expect(result.value).toHaveLength(0);
        expect(result.value).toEqual([]);
      }
    });

    it("should retrieve milestones with null fields", async () => {
      // Arrange - Create milestone with minimal fields
      const createResult = await run(createMilestone({}));
      expect(createResult.status).toBe("Success");
      if (createResult.status !== "Success") return;

      const milestoneId = createResult.value.id;

      // Act
      const result = await run(getMilestoneById({ id: milestoneId }));

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        expect(result.value.projectId).toBeNull();
        expect(result.value.assigneeUserId).toBeNull();
        expect(result.value.dueDate).toBeNull();
        expect(result.value.description).toBeNull();
      }
    });
  });

  describe("Update Milestone", () => {
    it("should update milestone successfully with all fields", async () => {
      // Arrange - Create a milestone
      const createResult = await run(
        createMilestone({
          projectId: 1,
          description: "Original description",
        }),
      );
      expect(createResult.status).toBe("Success");
      if (createResult.status !== "Success") return;

      const milestoneId = createResult.value.id;

      const updates: UpdateMilestoneInput = {
        projectId: 2,
        assigneeUserId: "123e4567-e89b-12d3-a456-426614174000",
        dueDate: new Date("2025-08-30T00:00:00Z"),
        description: "Updated description",
      };

      // Act
      const result = await run(updateMilestone({ id: milestoneId, updates }));

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        expect(result.value.id).toBe(milestoneId);
        expect(result.value.projectId).toBe(2);
        expect(result.value.assigneeUserId).toBe(
          "123e4567-e89b-12d3-a456-426614174000",
        );
        expect(result.value.description).toBe("Updated description");
        expect(result.value.dueDate).toBeInstanceOf(Date);
        expect(result.value.updatedAt.getTime()).toBeGreaterThan(
          createResult.value.createdAt.getTime(),
        );
      }
    });

    it("should update only provided fields", async () => {
      // Arrange - Create milestone with all fields
      const createResult = await run(
        createMilestone({
          projectId: 5,
          assigneeUserId: "550e8400-e29b-41d4-a716-446655440000",
          dueDate: new Date("2025-05-01T00:00:00Z"),
          description: "Original milestone",
        }),
      );
      expect(createResult.status).toBe("Success");
      if (createResult.status !== "Success") return;

      const milestoneId = createResult.value.id;

      // Act - Update only description
      const result = await run(
        updateMilestone({
          id: milestoneId,
          updates: { description: "Updated description only" },
        }),
      );

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        expect(result.value.description).toBe("Updated description only");
        expect(result.value.projectId).toBe(5);
        expect(result.value.assigneeUserId).toBe(
          "550e8400-e29b-41d4-a716-446655440000",
        );
      }
    });

    it("should update only project ID", async () => {
      // Arrange
      const createResult = await run(
        createMilestone({
          projectId: 10,
          description: "Keep this description",
        }),
      );
      expect(createResult.status).toBe("Success");
      if (createResult.status !== "Success") return;

      const milestoneId = createResult.value.id;

      // Act
      const result = await run(
        updateMilestone({
          id: milestoneId,
          updates: { projectId: 20 },
        }),
      );

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        expect(result.value.projectId).toBe(20);
        expect(result.value.description).toBe("Keep this description");
      }
    });

    it("should update only due date", async () => {
      // Arrange
      const oldDate = new Date("2025-01-01T00:00:00Z");
      const newDate = new Date("2025-12-31T23:59:59Z");

      const createResult = await run(
        createMilestone({
          dueDate: oldDate,
          description: "Date update test",
        }),
      );
      expect(createResult.status).toBe("Success");
      if (createResult.status !== "Success") return;

      const milestoneId = createResult.value.id;

      // Act
      const result = await run(
        updateMilestone({
          id: milestoneId,
          updates: { dueDate: newDate },
        }),
      );

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        expect(result.value.dueDate).toBeInstanceOf(Date);
        expect(result.value.dueDate?.toISOString()).toBe(newDate.toISOString());
        expect(result.value.description).toBe("Date update test");
      }
    });

    it("should update assignee user ID", async () => {
      // Arrange
      const createResult = await run(
        createMilestone({
          assigneeUserId: "550e8400-e29b-41d4-a716-446655440000",
          description: "Reassignment test",
        }),
      );
      expect(createResult.status).toBe("Success");
      if (createResult.status !== "Success") return;

      const milestoneId = createResult.value.id;

      // Act
      const result = await run(
        updateMilestone({
          id: milestoneId,
          updates: { assigneeUserId: "123e4567-e89b-12d3-a456-426614174000" },
        }),
      );

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        expect(result.value.assigneeUserId).toBe(
          "123e4567-e89b-12d3-a456-426614174000",
        );
        expect(result.value.description).toBe("Reassignment test");
      }
    });

    it("should fail when updating non-existent milestone", async () => {
      // Act
      const result = await run(
        updateMilestone({
          id: 99999,
          updates: { description: "New description" },
        }),
      );

      // Assert
      expect(result.status).toBe("Failure");

      if (result.status === "Failure") {
        expect(result.error.code).toBe("NOT_FOUND");
      }
    });

    it("should update milestone to set null values", async () => {
      // Arrange - Create milestone with all fields
      const createResult = await run(
        createMilestone({
          projectId: 5,
          assigneeUserId: "550e8400-e29b-41d4-a716-446655440000",
          dueDate: new Date("2025-05-01T00:00:00Z"),
          description: "To be cleared",
        }),
      );
      expect(createResult.status).toBe("Success");
      if (createResult.status !== "Success") return;

      const milestoneId = createResult.value.id;

      // Act - Clear fields by setting to null
      const result = await run(
        updateMilestone({
          id: milestoneId,
          updates: {
            projectId: null,
            assigneeUserId: null,
            dueDate: null,
            description: null,
          },
        }),
      );

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        expect(result.value.projectId).toBeNull();
        expect(result.value.assigneeUserId).toBeNull();
        expect(result.value.dueDate).toBeNull();
        expect(result.value.description).toBeNull();
      }
    });
  });

  describe("Delete Milestone", () => {
    it("should delete milestone successfully", async () => {
      // Arrange - Create a milestone
      const createResult = await run(
        createMilestone({
          description: "To be deleted",
        }),
      );
      expect(createResult.status).toBe("Success");
      if (createResult.status !== "Success") return;

      const milestoneId = createResult.value.id;

      // Act
      const result = await run(deleteMilestone({ id: milestoneId }));

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        expect(result.value.id).toBe(milestoneId);
        expect(result.value.message).toBe("Milestone deleted successfully");
      }

      // Verify deletion in database
      const db = getTestDb();
      const milestoneRecords = await db
        .select()
        .from(milestones)
        .where(eq(milestones.id, milestoneId));

      expect(milestoneRecords).toHaveLength(0);
    });

    it("should fail when deleting non-existent milestone", async () => {
      // Act
      const result = await run(deleteMilestone({ id: 99999 }));

      // Assert
      expect(result.status).toBe("Failure");

      if (result.status === "Failure") {
        expect(result.error.code).toBe("NOT_FOUND");
      }
    });

    it("should delete milestone and verify it cannot be retrieved", async () => {
      // Arrange
      const createResult = await run(
        createMilestone({
          description: "Temporary milestone",
        }),
      );
      expect(createResult.status).toBe("Success");
      if (createResult.status !== "Success") return;

      const milestoneId = createResult.value.id;

      // Act - Delete
      const deleteResult = await run(deleteMilestone({ id: milestoneId }));
      expect(deleteResult.status).toBe("Success");

      // Try to retrieve deleted milestone
      const getResult = await run(getMilestoneById({ id: milestoneId }));

      // Assert
      expect(getResult.status).toBe("Failure");

      if (getResult.status === "Failure") {
        expect(getResult.error.code).toBe("NOT_FOUND");
      }
    });

    it("should delete multiple milestones independently", async () => {
      // Arrange - Create 3 milestones
      const result1 = await run(
        createMilestone({ description: "Milestone 1" }),
      );
      const result2 = await run(
        createMilestone({ description: "Milestone 2" }),
      );
      const result3 = await run(
        createMilestone({ description: "Milestone 3" }),
      );

      expect(result1.status).toBe("Success");
      expect(result2.status).toBe("Success");
      expect(result3.status).toBe("Success");

      if (
        result1.status !== "Success" ||
        result2.status !== "Success" ||
        result3.status !== "Success"
      )
        return;

      // Act - Delete middle milestone
      const deleteResult = await run(deleteMilestone({ id: result2.value.id }));
      expect(deleteResult.status).toBe("Success");

      // Assert - Other two should still exist
      const getAll = await run(getAllMilestones());
      expect(getAll.status).toBe("Success");

      if (getAll.status === "Success") {
        expect(getAll.value).toHaveLength(2);
        expect(getAll.value.map((m) => m.id)).toEqual([
          result1.value.id,
          result3.value.id,
        ]);
      }
    });
  });
});
