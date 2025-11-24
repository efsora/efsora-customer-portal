import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { sql } from "drizzle-orm";
import { run } from "#lib/result";
import {
  generateUploadUrl,
  type GenerateUploadUrlInput,
} from "#core/documents";
import { createCompany } from "#core/companies";
import { createProject } from "#core/projects";
import { assignUserToCompany, assignUserToProject } from "#core/users";
import { cleanupDatabase } from "../helpers/database";
import { createTestUser } from "../helpers/invitation";

// Mock the S3 client to avoid real AWS calls
vi.mock("#infrastructure/s3/client", () => ({
  generatePresignedUploadUrl: vi.fn(async ({ key }) => ({
    url: `https://mock-bucket.s3.amazonaws.com/${String(key)}?X-Amz-Signature=mock`,
    key,
    expiresIn: 900,
  })),
  buildDocumentKey: (companyId: number, projectId: number, filename: string) =>
    `efsora-customer-portal/documents/${String(companyId)}/${String(projectId)}/${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`,
}));

describe("Generate Upload URL Integration Tests", () => {
  let testCompanyId: number;
  let testProjectId: number;
  let testUserId: string;
  let anotherCompanyId: number;
  let anotherProjectId: number;
  let anotherUserId: string;

  beforeEach(async () => {
    await cleanupDatabase();

    // Create first test company
    const companyResult = await run(
      createCompany({
        name: "Test Company",
        logoUrl: null,
        adminUserId: null,
      }),
    );

    if (companyResult.status !== "Success") {
      throw new Error("Failed to create test company");
    }
    testCompanyId = companyResult.value.id;

    // Create test project for first company
    const projectResult = await run(
      createProject({
        name: "Test Project",
        companyId: testCompanyId,
        status: 1,
      }),
    );

    if (projectResult.status !== "Success") {
      throw new Error("Failed to create test project");
    }
    testProjectId = projectResult.value.id;

    // Create test user for first company
    const userResult = await createTestUser({
      email: "testuser@test.com",
      password: "password123",
      name: "Test User",
    });

    if (userResult.status !== "Success") {
      throw new Error("Failed to create test user");
    }
    testUserId = userResult.value.user.id;

    // Assign user to company
    const assignResult = await run(
      assignUserToCompany({
        userId: testUserId,
        companyId: testCompanyId,
      }),
    );

    if (assignResult.status !== "Success") {
      throw new Error("Failed to assign user to company");
    }

    // Assign user to project
    const assignProjectResult = await run(
      assignUserToProject({
        userId: testUserId,
        projectId: testProjectId,
      }),
    );

    if (assignProjectResult.status !== "Success") {
      throw new Error("Failed to assign user to project");
    }

    // Create second company for access control tests
    const company2Result = await run(
      createCompany({
        name: "Another Company",
        logoUrl: null,
        adminUserId: null,
      }),
    );

    if (company2Result.status !== "Success") {
      throw new Error("Failed to create second company");
    }
    anotherCompanyId = company2Result.value.id;

    // Create project for second company
    const project2Result = await run(
      createProject({
        name: "Another Project",
        companyId: anotherCompanyId,
        status: 1,
      }),
    );

    if (project2Result.status !== "Success") {
      throw new Error("Failed to create second project");
    }
    anotherProjectId = project2Result.value.id;

    // Create user for second company
    const user2Result = await createTestUser({
      email: "anotheruser@test.com",
      password: "password123",
      name: "Another User",
    });

    if (user2Result.status !== "Success") {
      throw new Error("Failed to create second user");
    }
    anotherUserId = user2Result.value.user.id;

    // Assign user to second company
    const assign2Result = await run(
      assignUserToCompany({
        userId: anotherUserId,
        companyId: anotherCompanyId,
      }),
    );

    if (assign2Result.status !== "Success") {
      throw new Error("Failed to assign second user to company");
    }

    // Assign second user to second project
    const assignProject2Result = await run(
      assignUserToProject({
        userId: anotherUserId,
        projectId: anotherProjectId,
      }),
    );

    if (assignProject2Result.status !== "Success") {
      throw new Error("Failed to assign second user to project");
    }
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("generateUploadUrl - Success Cases", () => {
    it("should generate pre-signed URL successfully with valid input", async () => {
      const input: GenerateUploadUrlInput = {
        fileName: "project-proposal.pdf",
        fileSize: 1048576,
        fileType: "application/pdf",
        projectId: testProjectId,
        userId: testUserId,
      };

      const result = await run(generateUploadUrl(input));

      expect(result.status).toBe("Success");
      if (result.status === "Success") {
        expect(result.value.uploadUrl).toMatch(
          /^https:\/\/mock-bucket\.s3\.amazonaws\.com\/.+/,
        );
        expect(result.value.uploadUrl).toContain("project-proposal.pdf");
        expect(result.value.uploadUrl).toContain(
          `${String(testCompanyId)}/${String(testProjectId)}`,
        );
        expect(result.value.expiresIn).toBe(900); // 15 minutes
      }
    });

    it("should sanitize filename with special characters", async () => {
      const input: GenerateUploadUrlInput = {
        fileName: "my file with spaces & special!@#chars.pdf",
        fileSize: 2097152,
        fileType: "application/pdf",
        projectId: testProjectId,
        userId: testUserId,
      };

      const result = await run(generateUploadUrl(input));

      expect(result.status).toBe("Success");
      if (result.status === "Success") {
        expect(result.value.uploadUrl).toContain("my_file_with_spaces");
        expect(result.value.uploadUrl).not.toContain(" ");
        expect(result.value.uploadUrl).not.toContain("@");
        expect(result.value.uploadUrl).not.toContain("#");
      }
    });

    it("should handle different file types", async () => {
      const testCases = [
        { fileType: "application/pdf", fileName: "document.pdf" },
        { fileType: "image/jpeg", fileName: "photo.jpg" },
        { fileType: "image/png", fileName: "screenshot.png" },
        { fileType: "application/vnd.ms-excel", fileName: "spreadsheet.xls" },
        {
          fileType:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          fileName: "report.docx",
        },
      ];

      for (const testCase of testCases) {
        const input: GenerateUploadUrlInput = {
          fileName: testCase.fileName,
          fileSize: 500000,
          fileType: testCase.fileType,
          projectId: testProjectId,
          userId: testUserId,
        };

        const result = await run(generateUploadUrl(input));

        expect(result.status).toBe("Success");
        if (result.status === "Success") {
          expect(result.value.uploadUrl).toContain(testCase.fileName);
          expect(result.value.expiresIn).toBe(900);
        }
      }
    });

    it("should handle large file sizes", async () => {
      const input: GenerateUploadUrlInput = {
        fileName: "large-video.mp4",
        fileSize: 104857600, // 100 MB
        fileType: "video/mp4",
        projectId: testProjectId,
        userId: testUserId,
      };

      const result = await run(generateUploadUrl(input));

      expect(result.status).toBe("Success");
      if (result.status === "Success") {
        expect(result.value.uploadUrl).toBeDefined();
        expect(result.value.uploadUrl).toContain("large-video.mp4");
      }
    });
  });

  describe("generateUploadUrl - Project Validation", () => {
    it("should fail when project does not exist", async () => {
      const input: GenerateUploadUrlInput = {
        fileName: "test.pdf",
        fileSize: 1000,
        fileType: "application/pdf",
        projectId: 99999, // Non-existent project
        userId: testUserId,
      };

      const result = await run(generateUploadUrl(input));

      expect(result.status).toBe("Failure");
      if (result.status === "Failure") {
        expect(result.error.code).toBe("DOCUMENT_PROJECT_NOT_FOUND");
        expect(result.error.message).toContain(
          "Project with ID 99999 not found",
        );
      }
    });

    it("should fail when project has no company", async () => {
      // Create project without company (edge case)
      const projectNoCompanyResult = await run(
        createProject({
          name: "Project Without Company",
          companyId: testCompanyId,
          status: 1,
        }),
      );

      if (projectNoCompanyResult.status !== "Success") {
        throw new Error("Failed to create project");
      }

      // Manually set companyId to null via raw SQL (simulating orphaned project)
      const { getTestDb } = await import("../helpers/database");
      const db = getTestDb();
      await db.execute(
        sql.raw(
          `UPDATE projects SET company_id = NULL WHERE id = ${String(projectNoCompanyResult.value.id)}`,
        ),
      );

      const input: GenerateUploadUrlInput = {
        fileName: "test.pdf",
        fileSize: 1000,
        fileType: "application/pdf",
        projectId: projectNoCompanyResult.value.id,
        userId: testUserId,
      };

      const result = await run(generateUploadUrl(input));

      expect(result.status).toBe("Failure");
      if (result.status === "Failure") {
        expect(result.error.code).toBe("DOCUMENT_PROJECT_NO_COMPANY");
        expect(result.error.message).toContain("has no associated company");
      }
    });
  });

  describe("generateUploadUrl - User Access Control", () => {
    it("should fail when user does not exist", async () => {
      const input: GenerateUploadUrlInput = {
        fileName: "test.pdf",
        fileSize: 1000,
        fileType: "application/pdf",
        projectId: testProjectId,
        userId: "00000000-0000-0000-0000-000000000000", // Non-existent user
      };

      const result = await run(generateUploadUrl(input));

      expect(result.status).toBe("Failure");
      if (result.status === "Failure") {
        expect(result.error.code).toBe("DOCUMENT_USER_NOT_FOUND");
        expect(result.error.message).toContain("User with ID");
        expect(result.error.message).toContain("not found");
      }
    });

    it("should fail when user is not assigned to the project", async () => {
      // User from company 1 trying to upload to company 2's project
      // (user is not assigned to that project)
      const input: GenerateUploadUrlInput = {
        fileName: "unauthorized.pdf",
        fileSize: 1000,
        fileType: "application/pdf",
        projectId: anotherProjectId, // Project belongs to anotherCompanyId
        userId: testUserId, // User belongs to testCompanyId (and testProjectId)
      };

      const result = await run(generateUploadUrl(input));

      expect(result.status).toBe("Failure");
      if (result.status === "Failure") {
        expect(result.error.code).toBe("DOCUMENT_UNAUTHORIZED_PROJECT_ACCESS");
        expect(result.error.message).toContain(
          "does not belong to the same company",
        );
        expect(result.error.message).toContain(testUserId);
        expect(result.error.message).toContain(String(anotherProjectId));
      }
    });

    it("should succeed when user is assigned to the project", async () => {
      const input: GenerateUploadUrlInput = {
        fileName: "authorized.pdf",
        fileSize: 1000,
        fileType: "application/pdf",
        projectId: testProjectId, // Project belongs to testCompanyId
        userId: testUserId, // User is assigned to testProjectId
      };

      const result = await run(generateUploadUrl(input));

      expect(result.status).toBe("Success");
      if (result.status === "Success") {
        expect(result.value.uploadUrl).toBeDefined();
      }
    });

    it("should allow user from company 2 to upload to company 2's project", async () => {
      const input: GenerateUploadUrlInput = {
        fileName: "company2-doc.pdf",
        fileSize: 1000,
        fileType: "application/pdf",
        projectId: anotherProjectId, // Project belongs to anotherCompanyId
        userId: anotherUserId, // User belongs to anotherCompanyId
      };

      const result = await run(generateUploadUrl(input));

      expect(result.status).toBe("Success");
      if (result.status === "Success") {
        expect(result.value.uploadUrl).toContain(
          `${String(anotherCompanyId)}/${String(anotherProjectId)}`,
        );
      }
    });
  });

  describe("generateUploadUrl - S3 Key Structure", () => {
    it("should generate correct S3 key structure", async () => {
      const input: GenerateUploadUrlInput = {
        fileName: "test-document.pdf",
        fileSize: 1000,
        fileType: "application/pdf",
        projectId: testProjectId,
        userId: testUserId,
      };

      const result = await run(generateUploadUrl(input));

      expect(result.status).toBe("Success");
      if (result.status === "Success") {
        const expectedPath = `efsora-customer-portal/documents/${String(testCompanyId)}/${String(testProjectId)}/test-document.pdf`;
        expect(result.value.uploadUrl).toContain(expectedPath);
      }
    });

    it("should include all path components in correct order", async () => {
      const input: GenerateUploadUrlInput = {
        fileName: "nested-file.png",
        fileSize: 50000,
        fileType: "image/png",
        projectId: testProjectId,
        userId: testUserId,
      };

      const result = await run(generateUploadUrl(input));

      expect(result.status).toBe("Success");
      if (result.status === "Success") {
        const url = result.value.uploadUrl;
        // Verify path structure: prefix/documents/companyId/projectId/filename
        const expectedPath = `efsora-customer-portal/documents/${String(testCompanyId)}/${String(testProjectId)}/nested-file.png`;
        expect(url).toContain(expectedPath);

        // Verify the path components appear in the correct order
        const documentsIdx = url.indexOf("efsora-customer-portal/documents");
        const companyIdx = url.indexOf(`documents/${String(testCompanyId)}/`);
        const projectIdx = url.indexOf(`/${String(testProjectId)}/nested`);

        expect(documentsIdx).toBeGreaterThanOrEqual(0);
        expect(companyIdx).toBeGreaterThan(documentsIdx);
        expect(projectIdx).toBeGreaterThan(companyIdx);
      }
    });
  });

  describe("generateUploadUrl - Edge Cases", () => {
    it("should handle filename with only special characters", async () => {
      const input: GenerateUploadUrlInput = {
        fileName: "!@#$%^&*().pdf",
        fileSize: 1000,
        fileType: "application/pdf",
        projectId: testProjectId,
        userId: testUserId,
      };

      const result = await run(generateUploadUrl(input));

      expect(result.status).toBe("Success");
      if (result.status === "Success") {
        // All special chars should be replaced with underscores, keeping only extension
        expect(result.value.uploadUrl).toMatch(/________\.pdf/);
      }
    });

    it("should handle very long filenames", async () => {
      const longFilename = "a".repeat(250) + ".pdf"; // 254 characters total
      const input: GenerateUploadUrlInput = {
        fileName: longFilename,
        fileSize: 1000,
        fileType: "application/pdf",
        projectId: testProjectId,
        userId: testUserId,
      };

      const result = await run(generateUploadUrl(input));

      expect(result.status).toBe("Success");
      if (result.status === "Success") {
        expect(result.value.uploadUrl).toContain(longFilename);
      }
    });

    it("should handle filename with Unicode characters", async () => {
      const input: GenerateUploadUrlInput = {
        fileName: "文档-测试.pdf", // Chinese characters
        fileSize: 1000,
        fileType: "application/pdf",
        projectId: testProjectId,
        userId: testUserId,
      };

      const result = await run(generateUploadUrl(input));

      expect(result.status).toBe("Success");
      if (result.status === "Success") {
        // Unicode chars should be replaced with underscores
        // 文档-测试.pdf becomes __-__.pdf (2 chars, dash, 2 chars)
        expect(result.value.uploadUrl).toContain("__-__.pdf");
      }
    });

    it("should handle minimal file size", async () => {
      const input: GenerateUploadUrlInput = {
        fileName: "tiny.txt",
        fileSize: 1, // 1 byte
        fileType: "text/plain",
        projectId: testProjectId,
        userId: testUserId,
      };

      const result = await run(generateUploadUrl(input));

      expect(result.status).toBe("Success");
      if (result.status === "Success") {
        expect(result.value.uploadUrl).toBeDefined();
        expect(result.value.expiresIn).toBe(900);
      }
    });
  });

  describe("generateUploadUrl - URL Expiration", () => {
    it("should return consistent expiration time", async () => {
      const input: GenerateUploadUrlInput = {
        fileName: "expiration-test.pdf",
        fileSize: 1000,
        fileType: "application/pdf",
        projectId: testProjectId,
        userId: testUserId,
      };

      const result = await run(generateUploadUrl(input));

      expect(result.status).toBe("Success");
      if (result.status === "Success") {
        expect(result.value.expiresIn).toBe(900); // Exactly 15 minutes (900 seconds)
      }
    });
  });
});
