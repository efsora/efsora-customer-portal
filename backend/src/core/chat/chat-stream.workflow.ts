import { run } from "#lib/result/index";
import type { ChatStreamInput } from "./types/inputs";
import type { ChatStreamResult } from "./types/outputs";
import { chatRepository } from "#infrastructure/repositories/drizzle";
import {
  validateSessionOwnership,
  ensureSessionExists,
  saveUserMessage,
  streamAndSaveResponse,
} from "./chat-stream.operations";

/**
 * Main chat stream workflow
 * 1. Validate session ownership (security)
 * 2. Ensure session exists
 * 3. Save user message
 * 4. Stream AI response and save
 */
export async function* chatStream(input: ChatStreamInput): ChatStreamResult {
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
}

/**
 * Get chat history workflow
 * 1. Validate session ownership
 * 2. Return messages if session exists
 */
export async function getChatHistory(sessionId: string, userId: string) {
  // Validate ownership
  const ownershipResult = await run(
    validateSessionOwnership({ sessionId, userId, message: "" }),
  );
  if (ownershipResult.status === "Failure") {
    throw new Error(ownershipResult.error.message);
  }

  // Check if session exists
  const session = await chatRepository.findSessionById(sessionId);
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (session === null) {
    // Return empty array for new sessions (not an error)
    return [];
  }

  // Get messages
  return await chatRepository.getSessionMessages(sessionId);
}
