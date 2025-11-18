/**
 * Integration Tests for Companies Module
 *
 * Tests the complete company CRUD workflows with real database operations.
 * Uses PostgreSQL testcontainer for isolated, reproducible testing.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { eq } from "drizzle-orm";
import { run } from "#lib/result/index";
import {
  createCompany,
  getCompanyById,
  getAllCompanies,
  updateCompany,
  deleteCompany,
} from "#core/companies";
import type { CreateCompanyInput, UpdateCompanyInput } from "#core/companies";
import { companies } from "#db/schema";
import { cleanupDatabase, getTestDb } from "../helpers/database";

describe("Companies Module Integration Tests", () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  describe("Create Company", () => {
    it("should create company successfully with valid input", async () => {
      // Arrange
      const input: CreateCompanyInput = {
        name: "Acme Corporation",
        logoUrl: "https://example.com/logo.png",
        adminUserId: "550e8400-e29b-41d4-a716-446655440000",
      };

      // Act
      const result = await run(createCompany(input));

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        expect(result.value).toMatchObject({
          name: "Acme Corporation",
          logoUrl: "https://example.com/logo.png",
          adminUserId: "550e8400-e29b-41d4-a716-446655440000",
        });
        expect(result.value.id).toBeDefined();
        expect(typeof result.value.id).toBe("number");
        expect(result.value.createdAt).toBeInstanceOf(Date);
        expect(result.value.updatedAt).toBeInstanceOf(Date);

        // Verify in database
        const db = getTestDb();
        const companyRecords = await db
          .select()
          .from(companies)
          .where(eq(companies.id, result.value.id));

        expect(companyRecords).toHaveLength(1);
        expect(companyRecords[0].name).toBe("Acme Corporation");
      }
    });

    it("should create company with minimal required fields", async () => {
      // Arrange
      const input: CreateCompanyInput = {
        name: "Minimal Company",
      };

      // Act
      const result = await run(createCompany(input));

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        expect(result.value.name).toBe("Minimal Company");
        expect(result.value.logoUrl).toBeNull();
        expect(result.value.adminUserId).toBeNull();
      }
    });

    it("should fail when company name already exists", async () => {
      // Arrange - Create first company
      await run(createCompany({ name: "Duplicate Corp" }));

      // Act - Try to create duplicate
      const result = await run(createCompany({ name: "Duplicate Corp" }));

      // Assert
      expect(result.status).toBe("Failure");

      if (result.status === "Failure") {
        expect(result.error.code).toBe("CONFLICT");
        expect(result.error.message).toContain("already exists");
      }
    });
  });

  describe("Get Company", () => {
    it("should retrieve company by ID successfully", async () => {
      // Arrange - Create a company
      const createResult = await run(
        createCompany({
          name: "Test Company",
          logoUrl: "https://example.com/test.png",
        }),
      );

      expect(createResult.status).toBe("Success");
      if (createResult.status !== "Success") return;

      const companyId = createResult.value.id;

      // Act
      const result = await run(getCompanyById({ id: companyId }));

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        expect(result.value).toMatchObject({
          id: companyId,
          name: "Test Company",
          logoUrl: "https://example.com/test.png",
        });
      }
    });

    it("should fail when company ID does not exist", async () => {
      // Act
      const result = await run(getCompanyById({ id: 99999 }));

      // Assert
      expect(result.status).toBe("Failure");

      if (result.status === "Failure") {
        expect(result.error.code).toBe("NOT_FOUND");
        expect(result.error.message).toContain("not found");
      }
    });

    it("should retrieve all companies", async () => {
      // Arrange - Create multiple companies
      await run(createCompany({ name: "Company 1" }));
      await run(createCompany({ name: "Company 2" }));
      await run(createCompany({ name: "Company 3" }));

      // Act
      const result = await run(getAllCompanies());

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        expect(result.value).toHaveLength(3);
        expect(result.value.map((c) => c.name)).toEqual([
          "Company 1",
          "Company 2",
          "Company 3",
        ]);
      }
    });

    it("should return empty array when no companies exist", async () => {
      // Act
      const result = await run(getAllCompanies());

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        expect(result.value).toHaveLength(0);
      }
    });
  });

  describe("Update Company", () => {
    it("should update company successfully", async () => {
      // Arrange - Create a company
      const createResult = await run(createCompany({ name: "Original Name" }));
      expect(createResult.status).toBe("Success");
      if (createResult.status !== "Success") return;

      const companyId = createResult.value.id;

      const updates: UpdateCompanyInput = {
        name: "Updated Name",
        logoUrl: "https://example.com/new-logo.png",
      };

      // Act
      const result = await run(updateCompany({ id: companyId, updates }));

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        expect(result.value.id).toBe(companyId);
        expect(result.value.name).toBe("Updated Name");
        expect(result.value.logoUrl).toBe("https://example.com/new-logo.png");
        expect(result.value.updatedAt.getTime()).toBeGreaterThan(
          createResult.value.createdAt.getTime(),
        );
      }
    });

    it("should update only provided fields", async () => {
      // Arrange
      const createResult = await run(
        createCompany({
          name: "Test Company",
          logoUrl: "https://example.com/old-logo.png",
        }),
      );
      expect(createResult.status).toBe("Success");
      if (createResult.status !== "Success") return;

      const companyId = createResult.value.id;

      // Act - Update only name
      const result = await run(
        updateCompany({
          id: companyId,
          updates: { name: "New Name" },
        }),
      );

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        expect(result.value.name).toBe("New Name");
        expect(result.value.logoUrl).toBe("https://example.com/old-logo.png");
      }
    });

    it("should fail when updating non-existent company", async () => {
      // Act
      const result = await run(
        updateCompany({
          id: 99999,
          updates: { name: "New Name" },
        }),
      );

      // Assert
      expect(result.status).toBe("Failure");

      if (result.status === "Failure") {
        expect(result.error.code).toBe("NOT_FOUND");
      }
    });
  });

  describe("Delete Company", () => {
    it("should delete company successfully", async () => {
      // Arrange - Create a company
      const createResult = await run(createCompany({ name: "To Delete" }));
      expect(createResult.status).toBe("Success");
      if (createResult.status !== "Success") return;

      const companyId = createResult.value.id;

      // Act
      const result = await run(deleteCompany({ id: companyId }));

      // Assert
      expect(result.status).toBe("Success");

      if (result.status === "Success") {
        expect(result.value.id).toBe(companyId);
        expect(result.value.message).toBe("Company deleted successfully");
      }

      // Verify deletion in database
      const db = getTestDb();
      const companyRecords = await db
        .select()
        .from(companies)
        .where(eq(companies.id, companyId));

      expect(companyRecords).toHaveLength(0);
    });

    it("should fail when deleting non-existent company", async () => {
      // Act
      const result = await run(deleteCompany({ id: 99999 }));

      // Assert
      expect(result.status).toBe("Failure");

      if (result.status === "Failure") {
        expect(result.error.code).toBe("NOT_FOUND");
      }
    });
  });
});
