import type { NewRole, Role } from "#db/schema";
import { db } from "#db/client";
import { roles } from "#db/schema";
import { eq } from "drizzle-orm";

export type RoleRepository = ReturnType<typeof createRoleRepository>;

/**
 * Creates a Drizzle ORM implementation of Role Repository
 */
export function createRoleRepository(dbInstance: typeof db) {
  return {
    create: (data: NewRole) => {
      return dbInstance.insert(roles).values(data).returning();
    },

    findById: (id: number): Promise<Role[]> => {
      return dbInstance.select().from(roles).where(eq(roles.id, id)).limit(1);
    },

    findByName: (name: string): Promise<Role[]> => {
      return dbInstance
        .select()
        .from(roles)
        .where(eq(roles.name, name))
        .limit(1);
    },

    findAll: (): Promise<Role[]> => {
      return dbInstance.select().from(roles);
    },

    withTransaction: (tx: typeof db) => createRoleRepository(tx),
  };
}

/**
 * Singleton instance for use in operations
 */
export const roleRepository = createRoleRepository(db);
