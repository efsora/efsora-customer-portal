export type ChatStreamInput = {
  message: string;
  sessionId: string;
  userId: string;
};

export type GetChatHistoryInput = {
  sessionId: string;
  userId: string;
};
