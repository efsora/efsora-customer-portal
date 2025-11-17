import { describe, it, expect, beforeEach } from "vitest";
import { run } from "#lib/result";
import { getYourTeam } from "#core/projects";
import { createCompany } from "#core/companies";
import { createProject } from "#core/projects";
import { cleanupDatabase, getTestDb } from "../helpers/database";
import { users, roles } from "#db/schema";
import bcrypt from "bcrypt";

describe("Get Your Team Integration Tests", () => {
  const EFSORA_COMPANY_ID = 1;

  let customerCompanyId: number;
  let testProjectId: number;
  let customerUserId: string;
  let developerRoleId: number;
  let managementRoleId: number;

  beforeEach(async () => {
    await cleanupDatabase();

    const db = getTestDb();

    // Create roles
    const roleResults = await db
      .insert(roles)
      .values([{ name: "DEVELOPMENT" }, { name: "MANAGEMENT" }])
      .returning();

    developerRoleId = roleResults[0].id;
    managementRoleId = roleResults[1].id;

    // Create Efsora company (companyId = 1)
    const efsoraCompanyResult = await run(
      createCompany({
        name: "Efsora",
        logoUrl: null,
        adminUserId: null,
      }),
    );

    if (efsoraCompanyResult.status !== "Success") {
      throw new Error("Failed to create Efsora company");
    }

    // Verify Efsora company has ID 1 (as per requirement)
    if (efsoraCompanyResult.value.id !== EFSORA_COMPANY_ID) {
      throw new Error("Efsora company ID must be 1");
    }

    // Create customer company
    const customerCompanyResult = await run(
      createCompany({
        name: "Customer Company",
        logoUrl: null,
        adminUserId: null,
      }),
    );

    if (customerCompanyResult.status !== "Success") {
      throw new Error("Failed to create customer company");
    }

    customerCompanyId = customerCompanyResult.value.id;

    // Create a test project
    const projectResult = await run(
      createProject({
        name: "Test Project",
        companyId: customerCompanyId,
        status: 1,
      }),
    );

    if (projectResult.status !== "Success") {
      throw new Error("Failed to create test project");
    }

    testProjectId = projectResult.value.id;

    // Create a customer user (the authenticated user who will make the request)
    const hashedPassword = await bcrypt.hash("password123", 10);
    const customerUserResults = await db
      .insert(users)
      .values({
        email: "customer@company.com",
        name: "Customer",
        surname: "User",
        password: hashedPassword,
        companyId: customerCompanyId,
        projectId: testProjectId,
        roleId: developerRoleId,
        bio: "Customer user bio",
      })
      .returning();

    customerUserId = customerUserResults[0].id;
  });

  describe("getYourTeam", () => {
    it("should retrieve both customer and efsora teams successfully", async () => {
      const db = getTestDb();
      const hashedPassword = await bcrypt.hash("password123", 10);

      // Create additional customer team members
      await db.insert(users).values([
        {
          email: "customer2@company.com",
          name: "John",
          surname: "Doe",
          password: hashedPassword,
          companyId: customerCompanyId,
          projectId: testProjectId,
          roleId: developerRoleId,
          bio: "Senior developer",
        },
        {
          email: "customer3@company.com",
          name: "Jane",
          surname: "Smith",
          password: hashedPassword,
          companyId: customerCompanyId,
          projectId: testProjectId,
          roleId: managementRoleId,
          bio: "Project manager",
        },
      ]);

      // Create efsora team members
      await db.insert(users).values([
        {
          email: "efsora1@efsora.com",
          name: "Alice",
          surname: "Johnson",
          password: hashedPassword,
          companyId: EFSORA_COMPANY_ID,
          projectId: testProjectId,
          roleId: managementRoleId,
          bio: "Efsora PM",
        },
        {
          email: "efsora2@efsora.com",
          name: "Bob",
          surname: "Williams",
          password: hashedPassword,
          companyId: EFSORA_COMPANY_ID,
          projectId: testProjectId,
          roleId: developerRoleId,
          bio: "Efsora developer",
        },
      ]);

      const result = await run(
        getYourTeam({ projectId: testProjectId, userId: customerUserId }),
      );

      expect(result.status).toBe("Success");
      if (result.status === "Success") {
        // Verify customer team (should have 3 members including the authenticated user)
        expect(result.value.customerTeam).toBeInstanceOf(Array);
        expect(result.value.customerTeam.length).toBe(3);

        // Verify all customer team members are from the customer company
        const customerEmails = result.value.customerTeam.map((m) => m.email);
        expect(customerEmails).toContain("customer@company.com");
        expect(customerEmails).toContain("customer2@company.com");
        expect(customerEmails).toContain("customer3@company.com");

        // Verify efsora team (should have 2 members)
        expect(result.value.efsoraTeam).toBeInstanceOf(Array);
        expect(result.value.efsoraTeam.length).toBe(2);

        // Verify all efsora team members
        const efsoraEmails = result.value.efsoraTeam.map((m) => m.email);
        expect(efsoraEmails).toContain("efsora1@efsora.com");
        expect(efsoraEmails).toContain("efsora2@efsora.com");

        // Verify member structure (ExtendedUserData)
        const firstCustomer = result.value.customerTeam.find(
          (m) => m.email === "customer2@company.com",
        );
        expect(firstCustomer).toBeDefined();
        expect(firstCustomer?.name).toBe("John");
        expect(firstCustomer?.surname).toBe("Doe");
        expect(firstCustomer?.roleId).toBe(developerRoleId);
        expect(firstCustomer?.bio).toBe("Senior developer");
        expect(firstCustomer?.companyId).toBe(customerCompanyId);
        expect(firstCustomer?.projectId).toBe(testProjectId);
        expect(firstCustomer?.id).toBeDefined();
        expect(firstCustomer?.createdAt).toBeInstanceOf(Date);
        expect(firstCustomer?.updatedAt).toBeInstanceOf(Date);

        const firstEfsora = result.value.efsoraTeam.find(
          (m) => m.email === "efsora1@efsora.com",
        );
        expect(firstEfsora).toBeDefined();
        expect(firstEfsora?.name).toBe("Alice");
        expect(firstEfsora?.surname).toBe("Johnson");
        expect(firstEfsora?.roleId).toBe(managementRoleId);
        expect(firstEfsora?.bio).toBe("Efsora PM");
        expect(firstEfsora?.companyId).toBe(EFSORA_COMPANY_ID);
        expect(firstEfsora?.projectId).toBe(testProjectId);
      }
    });

    it("should return empty arrays when no team members assigned to project", async () => {
      // Create a new project with no members
      const emptyProjectResult = await run(
        createProject({
          name: "Empty Project",
          companyId: customerCompanyId,
          status: 1,
        }),
      );

      if (emptyProjectResult.status !== "Success") {
        throw new Error("Failed to create empty project");
      }

      const result = await run(
        getYourTeam({
          projectId: emptyProjectResult.value.id,
          userId: customerUserId,
        }),
      );

      expect(result.status).toBe("Success");
      if (result.status === "Success") {
        expect(result.value.customerTeam).toBeInstanceOf(Array);
        expect(result.value.customerTeam.length).toBe(0);
        expect(result.value.efsoraTeam).toBeInstanceOf(Array);
        expect(result.value.efsoraTeam.length).toBe(0);
      }
    });

    it("should handle users with null fields (name, surname, bio, role)", async () => {
      const db = getTestDb();
      const hashedPassword = await bcrypt.hash("password123", 10);

      // Create users with null fields
      await db.insert(users).values([
        {
          email: "minimal-customer@company.com",
          name: null,
          surname: null,
          password: hashedPassword,
          companyId: customerCompanyId,
          projectId: testProjectId,
          roleId: null, // No role assigned
          bio: null,
        },
        {
          email: "minimal-efsora@efsora.com",
          name: null,
          surname: null,
          password: hashedPassword,
          companyId: EFSORA_COMPANY_ID,
          projectId: testProjectId,
          roleId: null,
          bio: null,
        },
      ]);

      const result = await run(
        getYourTeam({ projectId: testProjectId, userId: customerUserId }),
      );

      expect(result.status).toBe("Success");
      if (result.status === "Success") {
        const minimalCustomer = result.value.customerTeam.find(
          (m) => m.email === "minimal-customer@company.com",
        );
        expect(minimalCustomer).toBeDefined();
        expect(minimalCustomer?.name).toBeNull();
        expect(minimalCustomer?.surname).toBeNull();
        expect(minimalCustomer?.roleId).toBeNull();
        expect(minimalCustomer?.bio).toBeNull();

        const minimalEfsora = result.value.efsoraTeam.find(
          (m) => m.email === "minimal-efsora@efsora.com",
        );
        expect(minimalEfsora).toBeDefined();
        expect(minimalEfsora?.name).toBeNull();
        expect(minimalEfsora?.surname).toBeNull();
        expect(minimalEfsora?.roleId).toBeNull();
        expect(minimalEfsora?.bio).toBeNull();
      }
    });

    it("should only return users assigned to the specific project", async () => {
      const db = getTestDb();
      const hashedPassword = await bcrypt.hash("password123", 10);

      // Create another project
      const otherProjectResult = await run(
        createProject({
          name: "Other Project",
          companyId: customerCompanyId,
          status: 1,
        }),
      );

      if (otherProjectResult.status !== "Success") {
        throw new Error("Failed to create other project");
      }

      // Create users on different projects
      await db.insert(users).values([
        {
          email: "correct-project@company.com",
          name: "Correct",
          surname: "Project",
          password: hashedPassword,
          companyId: customerCompanyId,
          projectId: testProjectId,
          roleId: developerRoleId,
          bio: "On correct project",
        },
        {
          email: "wrong-project@company.com",
          name: "Wrong",
          surname: "Project",
          password: hashedPassword,
          companyId: customerCompanyId,
          projectId: otherProjectResult.value.id, // Different project!
          roleId: developerRoleId,
          bio: "On wrong project",
        },
      ]);

      const result = await run(
        getYourTeam({ projectId: testProjectId, userId: customerUserId }),
      );

      expect(result.status).toBe("Success");
      if (result.status === "Success") {
        const emails = result.value.customerTeam.map((m) => m.email);
        expect(emails).toContain("correct-project@company.com");
        expect(emails).not.toContain("wrong-project@company.com");
      }
    });

    it("should only return efsora users from companyId = 1", async () => {
      const db = getTestDb();
      const hashedPassword = await bcrypt.hash("password123", 10);

      // Create a third company (not efsora, not customer)
      const thirdCompanyResult = await run(
        createCompany({
          name: "Third Company",
          logoUrl: null,
          adminUserId: null,
        }),
      );

      if (thirdCompanyResult.status !== "Success") {
        throw new Error("Failed to create third company");
      }

      // Create users from different companies on the same project
      await db.insert(users).values([
        {
          email: "efsora-correct@efsora.com",
          name: "Efsora",
          surname: "Correct",
          password: hashedPassword,
          companyId: EFSORA_COMPANY_ID,
          projectId: testProjectId,
          roleId: developerRoleId,
          bio: "Efsora team",
        },
        {
          email: "third-company@other.com",
          name: "Third",
          surname: "Company",
          password: hashedPassword,
          companyId: thirdCompanyResult.value.id,
          projectId: testProjectId,
          roleId: developerRoleId,
          bio: "Not efsora",
        },
      ]);

      const result = await run(
        getYourTeam({ projectId: testProjectId, userId: customerUserId }),
      );

      expect(result.status).toBe("Success");
      if (result.status === "Success") {
        // Efsora team should only contain users from companyId = 1
        const efsoraEmails = result.value.efsoraTeam.map((m) => m.email);
        expect(efsoraEmails).toContain("efsora-correct@efsora.com");
        expect(efsoraEmails).not.toContain("third-company@other.com");

        // Third company user should NOT be in customer team either
        const customerEmails = result.value.customerTeam.map((m) => m.email);
        expect(customerEmails).not.toContain("third-company@other.com");
      }
    });

    it("should fail when user does not exist", async () => {
      const fakeUserId = "00000000-0000-0000-0000-000000000000";

      const result = await run(
        getYourTeam({ projectId: testProjectId, userId: fakeUserId }),
      );

      expect(result.status).toBe("Failure");
      if (result.status === "Failure") {
        expect(result.error.code).toBe("NOT_FOUND");
        expect(result.error.message).toContain(
          `User with ID ${fakeUserId} not found`,
        );
        if (result.error.code === "NOT_FOUND") {
          expect(result.error.resourceType).toBe("user");
        }
      }
    });

    it("should fail when user has no company assigned", async () => {
      const db = getTestDb();
      const hashedPassword = await bcrypt.hash("password123", 10);

      // Create user without company
      const userWithoutCompanyResults = await db
        .insert(users)
        .values({
          email: "no-company@example.com",
          name: "No",
          surname: "Company",
          password: hashedPassword,
          companyId: null, // No company!
          projectId: testProjectId,
          roleId: developerRoleId,
          bio: "No company user",
        })
        .returning();

      const userWithoutCompanyId = userWithoutCompanyResults[0].id;

      const result = await run(
        getYourTeam({
          projectId: testProjectId,
          userId: userWithoutCompanyId,
        }),
      );

      expect(result.status).toBe("Failure");
      if (result.status === "Failure") {
        expect(result.error.code).toBe("VALIDATION_ERROR");
        expect(result.error.message).toContain(
          `User ${userWithoutCompanyId} does not belong to any company`,
        );
      }
    });

    it("should handle projects with large teams efficiently", async () => {
      const db = getTestDb();
      const hashedPassword = await bcrypt.hash("password123", 10);

      // Create 20 customer users and 10 efsora users
      const customerUsers = Array.from({ length: 20 }, (_, i) => ({
        email: `customer${String(i)}@company.com`,
        name: `Customer${String(i)}`,
        surname: `User${String(i)}`,
        password: hashedPassword,
        companyId: customerCompanyId,
        projectId: testProjectId,
        roleId: i % 2 === 0 ? developerRoleId : managementRoleId,
        bio: `Customer bio ${String(i)}`,
      }));

      const efsoraUsers = Array.from({ length: 10 }, (_, i) => ({
        email: `efsora${String(i)}@efsora.com`,
        name: `Efsora${String(i)}`,
        surname: `User${String(i)}`,
        password: hashedPassword,
        companyId: EFSORA_COMPANY_ID,
        projectId: testProjectId,
        roleId: i % 2 === 0 ? developerRoleId : managementRoleId,
        bio: `Efsora bio ${String(i)}`,
      }));

      await db.insert(users).values([...customerUsers, ...efsoraUsers]);

      const result = await run(
        getYourTeam({ projectId: testProjectId, userId: customerUserId }),
      );

      expect(result.status).toBe("Success");
      if (result.status === "Success") {
        // +1 for the authenticated user created in beforeEach
        expect(result.value.customerTeam.length).toBe(21);
        expect(result.value.efsoraTeam.length).toBe(10);

        // Verify all have required fields
        result.value.customerTeam.forEach((member) => {
          expect(member.email).toBeDefined();
          expect(typeof member.email).toBe("string");
        });

        result.value.efsoraTeam.forEach((member) => {
          expect(member.email).toBeDefined();
          expect(typeof member.email).toBe("string");
        });
      }
    });
  });
});
