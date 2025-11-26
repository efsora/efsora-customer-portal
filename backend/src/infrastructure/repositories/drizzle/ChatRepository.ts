import { eq } from "drizzle-orm";
import { db } from "#db/client";
import { chatSessions, chatMessages } from "#db/schema";
import type { NewChatSession, NewChatMessage } from "#db/schema";

export function createChatRepository(dbInstance: typeof db) {
  return {
    /**
     * Create a new chat session
     */
    createSession: async (data: NewChatSession) => {
      const [session] = await dbInstance
        .insert(chatSessions)
        .values(data)
        .returning();
      return session;
    },

    /**
     * Find session by ID
     */
    findSessionById: async (id: string) => {
      const [session] = await dbInstance
        .select()
        .from(chatSessions)
        .where(eq(chatSessions.id, id));
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      return session ?? null;
    },

    /**
     * Save a chat message (user or assistant)
     */
    saveMessage: async (data: NewChatMessage) => {
      const [message] = await dbInstance
        .insert(chatMessages)
        .values(data)
        .returning();
      return message;
    },

    /**
     * Get all messages for a session, ordered by creation time
     */
    getSessionMessages: async (sessionId: string) => {
      return dbInstance
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.sessionId, sessionId))
        .orderBy(chatMessages.createdAt);
    },

    /**
     * Transaction support
     */
    withTransaction: (tx: typeof db) => createChatRepository(tx),
  };
}

export type ChatRepository = ReturnType<typeof createChatRepository>;
export const chatRepository = createChatRepository(db);
