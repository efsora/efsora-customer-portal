export type ChatStreamResult = AsyncGenerator<string, void, unknown>;

export type ChatMessage = {
  id: string;
  sessionId: string;
  role: string;
  content: string;
  createdAt: Date;
};

export type GetChatHistoryResult = ChatMessage[];
