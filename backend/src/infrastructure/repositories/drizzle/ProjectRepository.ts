import { eq, and } from "drizzle-orm";
import type { NewProject, Project } from "#db/schema";
import { projects } from "#db/schema";
import { db } from "#db/client";

/**
 * Project Repository
 *
 * Data access layer for projects using factory pattern.
 * Provides CRUD operations and optimized queries.
 */
export function createProjectRepository(dbInstance: typeof db) {
  return {
    /**
     * Create a new project
     */
    create: (data: NewProject): Promise<Project[]> => {
      return dbInstance.insert(projects).values(data).returning();
    },

    /**
     * Find project by ID
     */
    findById: (id: number): Promise<Project[]> => {
      return dbInstance
        .select()
        .from(projects)
        .where(eq(projects.id, id))
        .limit(1);
    },

    /**
     * Find project by name within a company (optimized for duplicate checking)
     */
    findByNameInCompany: (
      name: string,
      companyId: number,
    ): Promise<Project[]> => {
      return dbInstance
        .select()
        .from(projects)
        .where(and(eq(projects.name, name), eq(projects.companyId, companyId)))
        .limit(1);
    },

    /**
     * Find all projects (optionally filter by company)
     */
    findAll: (companyId?: number): Promise<Project[]> => {
      if (companyId !== undefined) {
        return dbInstance
          .select()
          .from(projects)
          .where(eq(projects.companyId, companyId));
      }
      return dbInstance.select().from(projects);
    },

    /**
     * Update project by ID
     */
    update: (id: number, data: Partial<NewProject>): Promise<Project[]> => {
      return dbInstance
        .update(projects)
        .set(data)
        .where(eq(projects.id, id))
        .returning();
    },

    /**
     * Delete project by ID
     */
    delete: (id: number): Promise<{ id: number }[]> => {
      return dbInstance
        .delete(projects)
        .where(eq(projects.id, id))
        .returning({ id: projects.id });
    },

    /**
     * Create a new repository instance with a transaction
     */
    withTransaction: (tx: typeof db) => createProjectRepository(tx),
  };
}

export type ProjectRepository = ReturnType<typeof createProjectRepository>;

/**
 * Singleton instance for production use
 */
export const projectRepository = createProjectRepository(db);
