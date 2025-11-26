/**
 * Chat Module
 * Public API for chat operations
 */

export { chatStream, getChatHistory } from "./chat-stream.workflow.js";
export type { ChatStreamInput, GetChatHistoryInput } from "./types/inputs.js";
export type {
  ChatStreamResult,
  ChatMessage,
  GetChatHistoryResult,
} from "./types/outputs.js";
