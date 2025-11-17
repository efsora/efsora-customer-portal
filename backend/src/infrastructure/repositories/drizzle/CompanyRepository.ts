import type { NewCompany, Company } from "#db/schema";
import { db } from "#db/client";
import { companies } from "#db/schema";
import { eq } from "drizzle-orm";

export type CompanyRepository = ReturnType<typeof createCompanyRepository>;

/**
 * Creates a Drizzle ORM implementation of Company Repository
 */
export function createCompanyRepository(dbInstance: typeof db) {
  return {
    create: (data: NewCompany) => {
      return dbInstance.insert(companies).values(data).returning();
    },

    findById: (id: number): Promise<Company[]> => {
      return dbInstance
        .select()
        .from(companies)
        .where(eq(companies.id, id))
        .limit(1);
    },

    findByName: (name: string): Promise<Company[]> => {
      return dbInstance
        .select()
        .from(companies)
        .where(eq(companies.name, name))
        .limit(1);
    },

    findAll: (): Promise<Company[]> => {
      return dbInstance.select().from(companies);
    },

    update: (id: number, data: Partial<Omit<NewCompany, "id">>) => {
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      return dbInstance
        .update(companies)
        .set(updateData)
        .where(eq(companies.id, id))
        .returning();
    },

    delete: (id: number) => {
      return dbInstance
        .delete(companies)
        .where(eq(companies.id, id))
        .returning();
    },

    withTransaction: (tx: unknown) => createCompanyRepository(tx as typeof db),
  };
}

/**
 * Singleton instance for use in operations
 */
export const companyRepository = createCompanyRepository(db);
