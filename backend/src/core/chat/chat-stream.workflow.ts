import { run } from "#lib/result/index";
import { logger } from "#infrastructure/logger";
import type { ChatStreamInput, GetChatHistoryInput } from "./types/inputs";
import type { ChatStreamResult, GetChatHistoryResult } from "./types/outputs";
import {
  validateSessionOwnership,
  ensureSessionExists,
  saveUserMessage,
  streamAndSaveResponse,
  findSessionById,
  getSessionMessages,
} from "./chat-stream.operations";

/**
 * Main chat stream workflow
 * 1. Validate session ownership (security)
 * 2. Ensure session exists
 * 3. Save user message
 * 4. Stream AI response and save
 */
export async function* chatStream(input: ChatStreamInput): ChatStreamResult {
  logger.info(
    { sessionId: input.sessionId, userId: input.userId },
    "Starting chat stream",
  );

  // SECURITY: Validate session ownership first
  const ownershipResult = await run(validateSessionOwnership(input));
  if (ownershipResult.status === "Failure") {
    throw new Error(ownershipResult.error.message);
  }

  // Ensure session exists (create if needed)
  const sessionResult = await run(ensureSessionExists(input));
  if (sessionResult.status === "Failure") {
    throw new Error(sessionResult.error.message);
  }

  // Save user message
  await saveUserMessage(input);

  // Stream response and save
  yield* streamAndSaveResponse(input);

  logger.info({ sessionId: input.sessionId }, "Chat stream workflow completed");
}

/**
 * Get chat history workflow
 * 1. Validate session ownership
 * 2. Return messages if session exists
 */
export async function getChatHistory(
  input: GetChatHistoryInput,
): Promise<GetChatHistoryResult> {
  logger.info(
    { sessionId: input.sessionId, userId: input.userId },
    "Getting chat history",
  );

  // Validate ownership
  const ownershipResult = await run(
    validateSessionOwnership({ ...input, message: "" }),
  );
  if (ownershipResult.status === "Failure") {
    throw new Error(ownershipResult.error.message);
  }

  // Check if session exists
  const session = await findSessionById(input.sessionId);
  if (session === null) {
    // Return empty array for new sessions (not an error)
    logger.info(
      { sessionId: input.sessionId },
      "Chat history: session not found, returning empty",
    );
    return [];
  }

  // Get messages via operation
  const messages = await getSessionMessages(input);

  logger.info(
    { sessionId: input.sessionId, messageCount: messages.length },
    "Chat history retrieved",
  );

  return messages;
}
