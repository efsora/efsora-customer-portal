/**
 * Integration Tests for User Assignment Operations
 *
 * Tests user assignment workflows (company, project, role) with real database operations.
 * Uses PostgreSQL testcontainer for isolated, reproducible testing.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { eq } from "drizzle-orm";
import { run } from "#lib/result/index";
import {
  assignUserToCompany,
  assignUserToProject,
  assignUserRole,
} from "#core/users";
import { createTestUser } from "../helpers/invitation";
import type {
  AssignToCompanyInput,
  AssignToProjectInput,
  AssignRoleInput,
  CreateUserInput,
} from "#core/users";
import { createCompany } from "#core/companies";
import { createProject } from "#core/projects";
import { users, roles } from "#db/schema";
import { cleanupDatabase, getTestDb } from "../helpers/database";

describe("User Assignment Integration Tests", () => {
  let testUserId: string;
  let testCompanyId: number;
  let testProjectId: number;
  let testRoleId: number;

  beforeEach(async () => {
    await cleanupDatabase();

    // Create test user
    const userInput: CreateUserInput = {
      email: "test.user@example.com",
      password: "password123",
      name: "Test User",
    };
    const userResult = await createTestUser(userInput);
    if (userResult.status === "Success") {
      testUserId = userResult.value.user.id;
    }

    // Create test company
    const companyResult = await run(
      createCompany({ name: "Test Company", logoUrl: null }),
    );
    if (companyResult.status === "Success") {
      testCompanyId = companyResult.value.id;
    }

    // Create test project
    const projectResult = await run(
      createProject({ name: "Test Project", companyId: testCompanyId }),
    );
    if (projectResult.status === "Success") {
      testProjectId = projectResult.value.id;
    }

    // Create test role (seed data should exist, but let's ensure at least one)
    const db = getTestDb();
    const existingRoles = await db.select().from(roles).limit(1);
    if (existingRoles.length > 0) {
      testRoleId = existingRoles[0].id;
    } else {
      // Fallback: create a test role if none exist
      const [newRole] = await db
        .insert(roles)
        .values({ name: "TEST_ROLE" })
        .returning();
      testRoleId = newRole.id;
    }
  });

  describe("Assign User to Company", () => {
    it("should assign user to company successfully", async () => {
      // Arrange
      const input: AssignToCompanyInput = {
        userId: testUserId,
        companyId: testCompanyId,
      };

      // Act
      const result = await run(assignUserToCompany(input));

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        expect(result.value.id).toBe(testUserId);
        expect(result.value.companyId).toBe(testCompanyId);
        expect(result.value.email).toBe("test.user@example.com");

        // Verify in database
        const db = getTestDb();
        const userRecords = await db
          .select()
          .from(users)
          .where(eq(users.id, testUserId));

        expect(userRecords).toHaveLength(1);
        expect(userRecords[0].companyId).toBe(testCompanyId);
      }
    });

    it("should fail when user does not exist", async () => {
      // Arrange
      const input: AssignToCompanyInput = {
        userId: "00000000-0000-0000-0000-000000000000",
        companyId: testCompanyId,
      };

      // Act
      const result = await run(assignUserToCompany(input));

      // Assert
      expect(result.status).toBe("Failure");

      if (result.status === "Failure") {
        expect(result.error.code).toBe("USER_NOT_FOUND");
        expect(result.error.message).toContain("User not found");
      }
    });

    it("should fail when company does not exist", async () => {
      // Arrange
      const input: AssignToCompanyInput = {
        userId: testUserId,
        companyId: 99999,
      };

      // Act
      const result = await run(assignUserToCompany(input));

      // Assert
      expect(result.status).toBe("Failure");

      if (result.status === "Failure") {
        expect(result.error.code).toBe("USER_COMPANY_NOT_FOUND");
        expect(result.error.message).toContain("Company not found");
      }
    });

    it("should allow reassigning user to different company", async () => {
      // Arrange - First assignment
      await run(
        assignUserToCompany({
          userId: testUserId,
          companyId: testCompanyId,
        }),
      );

      // Create second company
      const company2Result = await run(
        createCompany({ name: "Second Company" }),
      );
      const company2Id =
        company2Result.status === "Success" ? company2Result.value.id : 0;

      // Act - Reassign to second company
      const result = await run(
        assignUserToCompany({
          userId: testUserId,
          companyId: company2Id,
        }),
      );

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        expect(result.value.companyId).toBe(company2Id);

        // Verify in database
        const db = getTestDb();
        const userRecords = await db
          .select()
          .from(users)
          .where(eq(users.id, testUserId));

        expect(userRecords[0].companyId).toBe(company2Id);
      }
    });
  });

  describe("Assign User to Project", () => {
    it("should assign user to project successfully", async () => {
      // Arrange
      const input: AssignToProjectInput = {
        userId: testUserId,
        projectId: testProjectId,
      };

      // Act
      const result = await run(assignUserToProject(input));

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        expect(result.value.id).toBe(testUserId);
        expect(result.value.projectId).toBe(testProjectId);

        // Verify in database
        const db = getTestDb();
        const userRecords = await db
          .select()
          .from(users)
          .where(eq(users.id, testUserId));

        expect(userRecords).toHaveLength(1);
        expect(userRecords[0].projectId).toBe(testProjectId);
      }
    });

    it("should fail when user does not exist", async () => {
      // Arrange
      const input: AssignToProjectInput = {
        userId: "00000000-0000-0000-0000-000000000000",
        projectId: testProjectId,
      };

      // Act
      const result = await run(assignUserToProject(input));

      // Assert
      expect(result.status).toBe("Failure");

      if (result.status === "Failure") {
        expect(result.error.code).toBe("USER_NOT_FOUND");
        expect(result.error.message).toContain("User not found");
      }
    });

    it("should fail when project does not exist", async () => {
      // Arrange
      const input: AssignToProjectInput = {
        userId: testUserId,
        projectId: 99999,
      };

      // Act
      const result = await run(assignUserToProject(input));

      // Assert
      expect(result.status).toBe("Failure");

      if (result.status === "Failure") {
        expect(result.error.code).toBe("USER_PROJECT_NOT_FOUND");
        expect(result.error.message).toContain("Project not found");
      }
    });

    it("should allow reassigning user to different project", async () => {
      // Arrange - First assignment
      await run(
        assignUserToProject({
          userId: testUserId,
          projectId: testProjectId,
        }),
      );

      // Create second project
      const project2Result = await run(
        createProject({ name: "Second Project", companyId: testCompanyId }),
      );
      const project2Id =
        project2Result.status === "Success" ? project2Result.value.id : 0;

      // Act - Reassign to second project
      const result = await run(
        assignUserToProject({
          userId: testUserId,
          projectId: project2Id,
        }),
      );

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        expect(result.value.projectId).toBe(project2Id);

        // Verify in database
        const db = getTestDb();
        const userRecords = await db
          .select()
          .from(users)
          .where(eq(users.id, testUserId));

        expect(userRecords[0].projectId).toBe(project2Id);
      }
    });
  });

  describe("Assign Role to User", () => {
    it("should assign role to user successfully", async () => {
      // Arrange
      const input: AssignRoleInput = {
        userId: testUserId,
        roleId: testRoleId,
      };

      // Act
      const result = await run(assignUserRole(input));

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        expect(result.value.id).toBe(testUserId);
        expect(result.value.roleId).toBe(testRoleId);

        // Verify in database
        const db = getTestDb();
        const userRecords = await db
          .select()
          .from(users)
          .where(eq(users.id, testUserId));

        expect(userRecords).toHaveLength(1);
        expect(userRecords[0].roleId).toBe(testRoleId);
      }
    });

    it("should fail when user does not exist", async () => {
      // Arrange
      const input: AssignRoleInput = {
        userId: "00000000-0000-0000-0000-000000000000",
        roleId: testRoleId,
      };

      // Act
      const result = await run(assignUserRole(input));

      // Assert
      expect(result.status).toBe("Failure");

      if (result.status === "Failure") {
        expect(result.error.code).toBe("USER_NOT_FOUND");
        expect(result.error.message).toContain("User not found");
      }
    });

    it("should fail when role does not exist", async () => {
      // Arrange
      const input: AssignRoleInput = {
        userId: testUserId,
        roleId: 99999,
      };

      // Act
      const result = await run(assignUserRole(input));

      // Assert
      expect(result.status).toBe("Failure");

      if (result.status === "Failure") {
        expect(result.error.code).toBe("USER_ROLE_NOT_FOUND");
        expect(result.error.message).toContain("Role not found");
      }
    });

    it("should allow reassigning user to different role", async () => {
      // Arrange - First assignment
      await run(
        assignUserRole({
          userId: testUserId,
          roleId: testRoleId,
        }),
      );

      // Create second role
      const db = getTestDb();
      const [newRole] = await db
        .insert(roles)
        .values({ name: "SECOND_ROLE" })
        .returning();

      // Act - Reassign to second role
      const result = await run(
        assignUserRole({
          userId: testUserId,
          roleId: newRole.id,
        }),
      );

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        expect(result.value.roleId).toBe(newRole.id);

        // Verify in database
        const userRecords = await db
          .select()
          .from(users)
          .where(eq(users.id, testUserId));

        expect(userRecords[0].roleId).toBe(newRole.id);
      }
    });
  });

  describe("Combined Assignments", () => {
    it("should assign user to company, project, and role in sequence", async () => {
      // Act - Assign company
      const companyResult = await run(
        assignUserToCompany({
          userId: testUserId,
          companyId: testCompanyId,
        }),
      );
      expect(companyResult.status).toBe("Success");

      // Act - Assign project
      const projectResult = await run(
        assignUserToProject({
          userId: testUserId,
          projectId: testProjectId,
        }),
      );
      expect(projectResult.status).toBe("Success");

      // Act - Assign role
      const roleResult = await run(
        assignUserRole({
          userId: testUserId,
          roleId: testRoleId,
        }),
      );
      expect(roleResult.status).toBe("Success");

      // Assert - Verify all assignments in database
      const db = getTestDb();
      const userRecords = await db
        .select()
        .from(users)
        .where(eq(users.id, testUserId));

      expect(userRecords).toHaveLength(1);
      expect(userRecords[0].companyId).toBe(testCompanyId);
      expect(userRecords[0].projectId).toBe(testProjectId);
      expect(userRecords[0].roleId).toBe(testRoleId);
    });

    it("should return extended user data with all assignments", async () => {
      // Arrange - Assign all
      await run(
        assignUserToCompany({
          userId: testUserId,
          companyId: testCompanyId,
        }),
      );
      await run(
        assignUserToProject({
          userId: testUserId,
          projectId: testProjectId,
        }),
      );

      // Act - Final assignment returns full data
      const result = await run(
        assignUserRole({
          userId: testUserId,
          roleId: testRoleId,
        }),
      );

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        expect(result.value).toMatchObject({
          id: testUserId,
          email: "test.user@example.com",
          name: "Test User",
          companyId: testCompanyId,
          projectId: testProjectId,
          roleId: testRoleId,
          surname: null,
          bio: null,
        });
        expect(result.value.createdAt).toBeInstanceOf(Date);
        expect(result.value.updatedAt).toBeInstanceOf(Date);
      }
    });
  });
});
