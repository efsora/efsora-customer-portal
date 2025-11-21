import { and, eq, gte } from "drizzle-orm";

import { db } from "#db/client";
import {
  portalMailInvitations,
  type NewPortalMailInvitation,
  type PortalMailInvitation,
} from "#db/schema";

/**
 * Portal Mail Invitation Repository
 * Handles database operations for email invitations
 */
export function createPortalMailInvitationRepository(dbInstance: typeof db) {
  return {
    /**
     * Find invitation by email
     */
    findByEmail: async (
      email: string,
    ): Promise<PortalMailInvitation | null> => {
      const results = await dbInstance
        .select()
        .from(portalMailInvitations)
        .where(eq(portalMailInvitations.email, email))
        .limit(1);

      return results[0] ?? null;
    },

    /**
     * Find valid (non-expired, pending) invitation by email
     */
    findValidByEmail: async (
      email: string,
    ): Promise<PortalMailInvitation | null> => {
      const now = new Date();
      const results = await dbInstance
        .select()
        .from(portalMailInvitations)
        .where(
          and(
            eq(portalMailInvitations.email, email),
            eq(portalMailInvitations.status, "PENDING"),
            gte(portalMailInvitations.dueDate, now),
          ),
        )
        .limit(1);

      return results[0] ?? null;
    },

    /**
     * Create a new invitation
     */
    create: async (
      data: NewPortalMailInvitation,
    ): Promise<PortalMailInvitation> => {
      const results = await dbInstance
        .insert(portalMailInvitations)
        .values(data)
        .returning();

      return results[0];
    },

    /**
     * Update invitation status
     */
    updateStatus: async (
      email: string,
      status: "PENDING" | "ACCEPTED" | "CANCELLED",
    ): Promise<PortalMailInvitation | null> => {
      const results = await dbInstance
        .update(portalMailInvitations)
        .set({ status, updatedAt: new Date() })
        .where(eq(portalMailInvitations.email, email))
        .returning();

      return results[0] ?? null;
    },

    /**
     * Upsert invitation (create or update to PENDING with new dueDate)
     * Used when sending new invitations - resets expired/accepted/cancelled invitations
     */
    upsert: async (
      data: NewPortalMailInvitation,
    ): Promise<PortalMailInvitation> => {
      // Try to update first
      const updateResults = await dbInstance
        .update(portalMailInvitations)
        .set({
          status: data.status,
          dueDate: data.dueDate,
          updatedAt: new Date(),
        })
        .where(eq(portalMailInvitations.email, data.email))
        .returning();

      if (updateResults.length > 0) {
        return updateResults[0];
      }

      // If no existing record, create new one
      const insertResults = await dbInstance
        .insert(portalMailInvitations)
        .values(data)
        .returning();

      return insertResults[0];
    },

    /**
     * Delete invitation by email
     */
    deleteByEmail: async (email: string): Promise<boolean> => {
      const results = await dbInstance
        .delete(portalMailInvitations)
        .where(eq(portalMailInvitations.email, email))
        .returning();

      return results.length > 0;
    },

    /**
     * Get all invitations
     */
    findAll: async (): Promise<PortalMailInvitation[]> => {
      return await dbInstance.select().from(portalMailInvitations);
    },

    /**
     * Support for transactions
     */
    withTransaction: (tx: unknown) =>
      createPortalMailInvitationRepository(tx as typeof db),
  };
}

export type PortalMailInvitationRepository = ReturnType<
  typeof createPortalMailInvitationRepository
>;

// Singleton instance
export const portalMailInvitationRepository =
  createPortalMailInvitationRepository(db);
