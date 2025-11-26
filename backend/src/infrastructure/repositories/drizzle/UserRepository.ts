import type { NewUser, User } from "#db/schema";

import { db } from "#db/client";
import { users, session } from "#db/schema";
import { eq, and } from "drizzle-orm";

export type UserRepository = ReturnType<typeof createUserRepository>;

/**
 * Creates a Drizzle ORM implementation of User Repository
 *
 * @function createUserRepository
 * @param {typeof db} dbInstance - The Drizzle database instance
 * @returns User repository implementation
 */
export function createUserRepository(dbInstance: typeof db) {
  return {
    create: (data: NewUser) => {
      return dbInstance.insert(users).values(data).returning();
    },

    delete: async (id: string) => {
      // Manually cascade delete sessions (ORM-only relations, no DB-level FK)
      await dbInstance.delete(session).where(eq(session.userId, id));

      // Delete user
      const result = await dbInstance
        .delete(users)
        .where(eq(users.id, id))
        .returning();
      return result;
    },

    findAll: () => {
      return dbInstance.select().from(users);
    },

    findByEmail: (email: string): Promise<User[]> => {
      return dbInstance
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
    },

    findById: (id: string): Promise<User[]> => {
      return dbInstance.select().from(users).where(eq(users.id, id)).limit(1);
    },

    update: (id: string, data: Partial<Omit<NewUser, "id">>) => {
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      return dbInstance
        .update(users)
        .set(updateData)
        .where(eq(users.id, id))
        .returning();
    },

    findByProjectAndCompany: (projectId: number, companyId: number) => {
      return dbInstance
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          surname: users.surname,
          bio: users.bio,
          companyId: users.companyId,
          roleId: users.roleId,
          projectId: users.projectId,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(
          and(eq(users.projectId, projectId), eq(users.companyId, companyId)),
        );
    },

    withTransaction: (tx: typeof db) => createUserRepository(tx),
  };
}
