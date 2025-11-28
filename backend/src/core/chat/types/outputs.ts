/**
 * Result of validating a chat session
 * This is what the workflow returns - pure data, no I/O
 */
export type ValidateChatSessionResult = {
  sessionId: string;
  userId: string;
  message: string;
  isNewSession: boolean;
};

/**
 * Chat message structure
 */
export type ChatMessage = {
  id: string;
  sessionId: string;
  role: string;
  content: string;
  createdAt: Date;
};

/**
 * Result of getting chat history
 */
export type GetChatHistoryResult = ChatMessage[];
