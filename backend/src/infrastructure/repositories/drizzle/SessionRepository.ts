import type { NewSession, Session } from "#db/schema";

import { db } from "#db/client";
import { session } from "#db/schema";
import { eq, and, lt, sql } from "drizzle-orm";

export type SessionRepository = ReturnType<typeof createSessionRepository>;

/**
 * Creates a Drizzle ORM implementation of Session Repository
 *
 * @function createSessionRepository
 * @param {typeof db} dbInstance - The Drizzle database instance
 * @returns Session repository implementation
 */
export function createSessionRepository(dbInstance: typeof db) {
  return {
    /**
     * Create a new session
     */
    create: (data: NewSession) => {
      return dbInstance.insert(session).values(data).returning();
    },

    /**
     * Find session by token
     */
    findByToken: (token: string): Promise<Session[]> => {
      return dbInstance
        .select()
        .from(session)
        .where(eq(session.token, token))
        .limit(1);
    },

    /**
     * Find all sessions for a user
     */
    findByUserId: (userId: string): Promise<Session[]> => {
      return dbInstance
        .select()
        .from(session)
        .where(eq(session.userId, userId));
    },

    /**
     * Find session by ID
     */
    findById: (id: string): Promise<Session[]> => {
      return dbInstance
        .select()
        .from(session)
        .where(eq(session.id, id))
        .limit(1);
    },

    /**
     * Delete a specific session by ID
     */
    delete: (id: string) => {
      return dbInstance.delete(session).where(eq(session.id, id)).returning();
    },

    /**
     * Delete a session by token (used for logout)
     */
    deleteByToken: (token: string) => {
      return dbInstance
        .delete(session)
        .where(eq(session.token, token))
        .returning();
    },

    /**
     * Delete all sessions for a user (logout from all devices)
     */
    deleteByUserId: (userId: string) => {
      return dbInstance
        .delete(session)
        .where(eq(session.userId, userId))
        .returning();
    },

    /**
     * Delete expired sessions (cleanup utility)
     */
    deleteExpired: () => {
      const now = sql`now()`;
      return dbInstance
        .delete(session)
        .where(lt(session.expiresAt, now))
        .returning();
    },

    /**
     * Update last active timestamp for a session
     */
    updateLastActive: (token: string) => {
      const now = sql`now()`;
      return dbInstance
        .update(session)
        .set({ lastActiveAt: now })
        .where(eq(session.token, token))
        .returning();
    },

    /**
     * Check if a session is valid (exists and not expired)
     */
    isValid: async (token: string): Promise<boolean> => {
      const now = sql`now()`;
      const result = await dbInstance
        .select()
        .from(session)
        .where(and(eq(session.token, token), lt(now, session.expiresAt)))
        .limit(1);
      return result.length > 0;
    },

    /**
     * Transaction support
     */
    withTransaction: (tx: unknown) => createSessionRepository(tx as typeof db),
  };
}

/**
 * Singleton instance for use in operations
 */
export const sessionRepository = createSessionRepository(db);
