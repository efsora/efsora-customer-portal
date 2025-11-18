import { describe, it, expect, beforeEach } from "vitest";
import { run } from "#lib/result";
import {
  createProject,
  getProjectById,
  getAllProjects,
  updateProject,
  deleteProject,
  type CreateProjectInput,
  type UpdateProjectInput,
  type ProjectIdInput,
} from "#core/projects";
import { createCompany } from "#core/companies";
import { cleanupDatabase } from "../helpers/database";

describe("Projects Module Integration Tests", () => {
  let testCompanyId: number;

  beforeEach(async () => {
    await cleanupDatabase();

    // Create a test company first (required for projects)
    const companyResult = await run(
      createCompany({
        name: "Test Company for Projects",
        logoUrl: null,
        adminUserId: null,
      }),
    );

    if (companyResult.status === "Success") {
      testCompanyId = companyResult.value.id;
    } else {
      throw new Error("Failed to create test company");
    }
  });

  describe("createProject", () => {
    it("should create project successfully with valid input", async () => {
      const input: CreateProjectInput = {
        name: "Website Redesign",
        companyId: testCompanyId,
        status: 1,
      };

      const result = await run(createProject(input));

      expect(result.status).toBe("Success");
      if (result.status === "Success") {
        expect(result.value.name).toBe("Website Redesign");
        expect(result.value.companyId).toBe(testCompanyId);
        expect(result.value.status).toBe(1);
        expect(result.value.id).toBeTypeOf("number");
        expect(result.value.createdAt).toBeInstanceOf(Date);
        expect(result.value.updatedAt).toBeInstanceOf(Date);
      }
    });

    it("should create project with nullable status", async () => {
      const input: CreateProjectInput = {
        name: "Mobile App",
        companyId: testCompanyId,
        status: null,
      };

      const result = await run(createProject(input));

      expect(result.status).toBe("Success");
      if (result.status === "Success") {
        expect(result.value.status).toBeNull();
      }
    });

    it("should fail when company does not exist", async () => {
      const input: CreateProjectInput = {
        name: "Invalid Project",
        companyId: 99999,
        status: 1,
      };

      const result = await run(createProject(input));

      expect(result.status).toBe("Failure");
      if (result.status === "Failure") {
        expect(result.error.code).toBe("NOT_FOUND");
        expect(result.error.message).toContain(
          "Company with ID 99999 not found",
        );
        if (result.error.code === "NOT_FOUND") {
          expect(result.error.resourceType).toBe("company");
        }
      }
    });

    it("should fail when project name already exists in company", async () => {
      const input: CreateProjectInput = {
        name: "Duplicate Project",
        companyId: testCompanyId,
        status: 1,
      };

      // Create first project
      await run(createProject(input));

      // Try to create duplicate
      const result = await run(createProject(input));

      expect(result.status).toBe("Failure");
      if (result.status === "Failure") {
        expect(result.error.code).toBe("CONFLICT");
        expect(result.error.message).toContain(
          'Project with name "Duplicate Project" already exists',
        );
      }
    });

    it("should allow same project name in different companies", async () => {
      // Create second company
      const company2Result = await run(
        createCompany({
          name: "Second Company",
          logoUrl: null,
          adminUserId: null,
        }),
      );

      if (company2Result.status !== "Success") {
        throw new Error("Failed to create second company");
      }

      const projectName = "Same Name Project";

      // Create project in first company
      const result1 = await run(
        createProject({
          name: projectName,
          companyId: testCompanyId,
          status: 1,
        }),
      );

      // Create project with same name in second company
      const result2 = await run(
        createProject({
          name: projectName,
          companyId: company2Result.value.id,
          status: 1,
        }),
      );

      expect(result1.status).toBe("Success");
      expect(result2.status).toBe("Success");
      if (result1.status === "Success" && result2.status === "Success") {
        expect(result1.value.id).not.toBe(result2.value.id);
        expect(result1.value.companyId).not.toBe(result2.value.companyId);
      }
    });
  });

  describe("getProjectById", () => {
    it("should retrieve project by ID", async () => {
      const createResult = await run(
        createProject({
          name: "Get Test Project",
          companyId: testCompanyId,
          status: 2,
        }),
      );

      if (createResult.status !== "Success") {
        throw new Error("Failed to create test project");
      }

      const input: ProjectIdInput = { id: createResult.value.id };
      const result = await run(getProjectById(input));

      expect(result.status).toBe("Success");
      if (result.status === "Success") {
        expect(result.value.id).toBe(createResult.value.id);
        expect(result.value.name).toBe("Get Test Project");
        expect(result.value.companyId).toBe(testCompanyId);
        expect(result.value.status).toBe(2);
      }
    });

    it("should fail when project does not exist", async () => {
      const input: ProjectIdInput = { id: 99999 };
      const result = await run(getProjectById(input));

      expect(result.status).toBe("Failure");
      if (result.status === "Failure") {
        expect(result.error.code).toBe("NOT_FOUND");
        expect(result.error.message).toContain(
          "Project with ID 99999 not found",
        );
        if (result.error.code === "NOT_FOUND") {
          expect(result.error.resourceType).toBe("project");
        }
      }
    });
  });

  describe("getAllProjects", () => {
    it("should retrieve all projects", async () => {
      // Create multiple projects
      await run(
        createProject({
          name: "Project 1",
          companyId: testCompanyId,
          status: 1,
        }),
      );
      await run(
        createProject({
          name: "Project 2",
          companyId: testCompanyId,
          status: 2,
        }),
      );

      const result = await run(getAllProjects());

      expect(result.status).toBe("Success");
      if (result.status === "Success") {
        expect(result.value).toBeInstanceOf(Array);
        expect(result.value.length).toBeGreaterThanOrEqual(2);
      }
    });

    it("should filter projects by company", async () => {
      // Create second company
      const company2Result = await run(
        createCompany({
          name: "Second Company for Filter",
          logoUrl: null,
          adminUserId: null,
        }),
      );

      if (company2Result.status !== "Success") {
        throw new Error("Failed to create second company");
      }

      // Create projects in both companies
      await run(
        createProject({
          name: "Company 1 Project",
          companyId: testCompanyId,
          status: 1,
        }),
      );
      await run(
        createProject({
          name: "Company 2 Project",
          companyId: company2Result.value.id,
          status: 1,
        }),
      );

      // Get projects for first company only
      const result = await run(getAllProjects({ companyId: testCompanyId }));

      expect(result.status).toBe("Success");
      if (result.status === "Success") {
        expect(result.value.every((p) => p.companyId === testCompanyId)).toBe(
          true,
        );
        expect(
          result.value.some((p) => p.companyId === company2Result.value.id),
        ).toBe(false);
      }
    });

    it("should return empty array when no projects exist", async () => {
      const result = await run(getAllProjects());

      expect(result.status).toBe("Success");
      if (result.status === "Success") {
        expect(result.value).toBeInstanceOf(Array);
        expect(result.value.length).toBe(0);
      }
    });
  });

  describe("updateProject", () => {
    it("should update project name", async () => {
      const createResult = await run(
        createProject({
          name: "Original Name",
          companyId: testCompanyId,
          status: 1,
        }),
      );

      if (createResult.status !== "Success") {
        throw new Error("Failed to create test project");
      }

      const updates: UpdateProjectInput = {
        name: "Updated Name",
      };

      const result = await run(
        updateProject({
          id: createResult.value.id,
          updates,
        }),
      );

      expect(result.status).toBe("Success");
      if (result.status === "Success") {
        expect(result.value.name).toBe("Updated Name");
        expect(result.value.id).toBe(createResult.value.id);
      }
    });

    it("should update project status", async () => {
      const createResult = await run(
        createProject({
          name: "Status Test",
          companyId: testCompanyId,
          status: 1,
        }),
      );

      if (createResult.status !== "Success") {
        throw new Error("Failed to create test project");
      }

      const updates: UpdateProjectInput = {
        status: 3,
      };

      const result = await run(
        updateProject({
          id: createResult.value.id,
          updates,
        }),
      );

      expect(result.status).toBe("Success");
      if (result.status === "Success") {
        expect(result.value.status).toBe(3);
      }
    });

    it("should fail when project does not exist", async () => {
      const updates: UpdateProjectInput = {
        name: "New Name",
      };

      const result = await run(
        updateProject({
          id: 99999,
          updates,
        }),
      );

      expect(result.status).toBe("Failure");
      if (result.status === "Failure") {
        expect(result.error.code).toBe("NOT_FOUND");
        expect(result.error.message).toContain(
          "Project with ID 99999 not found",
        );
      }
    });
  });

  describe("deleteProject", () => {
    it("should delete project successfully", async () => {
      const createResult = await run(
        createProject({
          name: "Delete Test",
          companyId: testCompanyId,
          status: 1,
        }),
      );

      if (createResult.status !== "Success") {
        throw new Error("Failed to create test project");
      }

      const result = await run(deleteProject({ id: createResult.value.id }));

      expect(result.status).toBe("Success");
      if (result.status === "Success") {
        expect(result.value.id).toBe(createResult.value.id);
        expect(result.value.message).toBe("Project deleted successfully");
      }

      // Verify project is deleted
      const getResult = await run(
        getProjectById({ id: createResult.value.id }),
      );
      expect(getResult.status).toBe("Failure");
    });

    it("should fail when project does not exist", async () => {
      const result = await run(deleteProject({ id: 99999 }));

      expect(result.status).toBe("Failure");
      if (result.status === "Failure") {
        expect(result.error.code).toBe("NOT_FOUND");
        expect(result.error.message).toContain(
          "Project with ID 99999 not found",
        );
      }
    });
  });
});
