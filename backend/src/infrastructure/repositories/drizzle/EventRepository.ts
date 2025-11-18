import type { NewEvent, Event } from "#db/schema";
import { db } from "#db/client";
import { events } from "#db/schema";
import { eq } from "drizzle-orm";

export type EventRepository = ReturnType<typeof createEventRepository>;

/**
 * Creates a Drizzle ORM implementation of Event Repository
 */
export function createEventRepository(dbInstance: typeof db) {
  return {
    create: (data: NewEvent) => {
      return dbInstance.insert(events).values(data).returning();
    },

    findById: (id: number): Promise<Event[]> => {
      return dbInstance.select().from(events).where(eq(events.id, id)).limit(1);
    },

    findAll: (): Promise<Event[]> => {
      return dbInstance.select().from(events);
    },

    findByMilestoneId: (milestoneId: number): Promise<Event[]> => {
      return dbInstance
        .select()
        .from(events)
        .where(eq(events.milestoneId, milestoneId));
    },

    update: (id: number, data: Partial<Omit<NewEvent, "id">>) => {
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      return dbInstance
        .update(events)
        .set(updateData)
        .where(eq(events.id, id))
        .returning();
    },

    delete: (id: number) => {
      return dbInstance.delete(events).where(eq(events.id, id)).returning();
    },

    withTransaction: (tx: unknown) => createEventRepository(tx as typeof db),
  };
}

/**
 * Singleton instance for use in operations
 */
export const eventRepository = createEventRepository(db);
