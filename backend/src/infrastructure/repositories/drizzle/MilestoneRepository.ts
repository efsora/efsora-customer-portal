import type { NewMilestone, Milestone } from "#db/schema";
import { db } from "#db/client";
import { milestones } from "#db/schema";
import { eq } from "drizzle-orm";

export type MilestoneRepository = ReturnType<typeof createMilestoneRepository>;

/**
 * Creates a Drizzle ORM implementation of Milestone Repository
 */
export function createMilestoneRepository(dbInstance: typeof db) {
  return {
    create: (data: NewMilestone): Promise<Milestone[]> => {
      return dbInstance.insert(milestones).values(data).returning();
    },

    findById: (id: number): Promise<Milestone[]> => {
      return dbInstance
        .select()
        .from(milestones)
        .where(eq(milestones.id, id))
        .limit(1);
    },

    findAll: (): Promise<Milestone[]> => {
      return dbInstance.select().from(milestones);
    },

    findByProjectId: (projectId: number): Promise<Milestone[]> => {
      return dbInstance
        .select()
        .from(milestones)
        .where(eq(milestones.projectId, projectId));
    },

    update: (
      id: number,
      data: Partial<Omit<NewMilestone, "id">>,
    ): Promise<Milestone[]> => {
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      return dbInstance
        .update(milestones)
        .set(updateData)
        .where(eq(milestones.id, id))
        .returning();
    },

    delete: (id: number): Promise<Milestone[]> => {
      return dbInstance
        .delete(milestones)
        .where(eq(milestones.id, id))
        .returning();
    },

    withTransaction: (tx: typeof db) => createMilestoneRepository(tx),
  };
}

/**
 * Singleton instance for use in operations
 */
export const milestoneRepository = createMilestoneRepository(db);
