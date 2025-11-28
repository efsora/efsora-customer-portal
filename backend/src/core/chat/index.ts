/**
 * Chat Module
 * Public API for chat operations
 *
 * FCIS COMPLIANT:
 * - Workflows return Result<T>, no run() calls
 * - Handler is responsible for I/O (streaming, saving messages)
 */

// Workflows (main entry points for handlers)
export { validateChatSession, getChatHistory } from "./chat-stream.workflow.js";

// Input types
export type { ChatStreamInput, GetChatHistoryInput } from "./types/inputs.js";

// Output types
export type {
  ValidateChatSessionResult,
  ChatMessage,
  GetChatHistoryResult,
} from "./types/outputs.js";
