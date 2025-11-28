import { pipe, type Result } from "#lib/result/index";
import type { ChatStreamInput, GetChatHistoryInput } from "./types/inputs";
import type {
  ValidateChatSessionResult,
  GetChatHistoryResult,
} from "./types/outputs";
import {
  validateSessionOwnership,
  ensureSessionExists,
  mapToValidatedSession,
  getChatHistoryMessages,
} from "./chat-stream.operations";

/**
 * Validate and prepare chat session workflow
 *
 * FCIS COMPLIANT: Returns Result<T>, no run() calls
 * Handler is responsible for calling run() and handling streaming I/O
 *
 * Flow:
 * 1. Validate session ownership (security check)
 * 2. Ensure session exists (create if needed)
 * 3. Return validated session info for handler to use
 *
 * @param input - ChatStreamInput with message, sessionId, and userId
 * @returns Result<ValidateChatSessionResult> - Validated session info
 *
 * @example
 * ```typescript
 * // In handler (imperative shell):
 * const result = await run(validateChatSession(input));
 * if (result.status === "Success") {
 *   // Proceed with streaming I/O
 * }
 * ```
 */
export function validateChatSession(
  input: ChatStreamInput,
): Result<ValidateChatSessionResult> {
  return pipe(
    validateSessionOwnership(input),
    ensureSessionExists,
    mapToValidatedSession,
  );
}

/**
 * Get chat history workflow
 *
 * FCIS COMPLIANT: Returns Result<T>, no run() calls
 *
 * Flow:
 * 1. Validate session ownership
 * 2. Fetch messages from database (returns empty array if session doesn't exist)
 *
 * @param input - GetChatHistoryInput with sessionId and userId
 * @returns Result<GetChatHistoryResult> - Array of chat messages
 *
 * @example
 * ```typescript
 * // In handler (imperative shell):
 * const result = await run(getChatHistory(input));
 * if (result.status === "Success") {
 *   return createSuccessResponse({ messages: result.value });
 * }
 * ```
 */
export function getChatHistory(
  input: GetChatHistoryInput,
): Result<GetChatHistoryResult> {
  return pipe(
    validateSessionOwnership({ ...input, message: "" }),
    getChatHistoryMessages,
  );
}
