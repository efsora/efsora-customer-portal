import { command, success } from "#lib/result/factories";
import type { Result } from "#lib/result/types";
import { chatRepository } from "#infrastructure/repositories/drizzle";
import { aiServiceClient } from "#infrastructure/ai-service";
import type { ChatStreamInput, GetChatHistoryInput } from "./types/inputs";
import type { GetChatHistoryResult } from "./types/outputs";
import { logger } from "#infrastructure/logger";

/**
 * Validate session ownership - ensures user can only access their own sessions
 * SECURITY: Critical validation to prevent unauthorized session access
 */
export function validateSessionOwnership(
  input: ChatStreamInput,
): Result<ChatStreamInput> {
  return command(
    async () => {
      const session = await chatRepository.findSessionById(input.sessionId);

      // Session exists but belongs to different user - FORBIDDEN
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (session !== null && session.userId !== input.userId) {
        logger.warn(
          {
            sessionId: input.sessionId,
            userId: input.userId,
            sessionUserId: session.userId,
          },
          "Unauthorized session access attempt",
        );
        throw new Error("Forbidden: Session access denied");
      }

      return input;
    },
    () => success(input),
  );
}

/**
 * Ensure chat session exists, create if not
 * Only creates if session doesn't exist (after ownership validation)
 */
export function ensureSessionExists(
  input: ChatStreamInput,
): Result<ChatStreamInput> {
  return command(
    async () => {
      const existing = await chatRepository.findSessionById(input.sessionId);
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (existing === null) {
        logger.info(
          { sessionId: input.sessionId, userId: input.userId },
          "Creating new chat session",
        );
        await chatRepository.createSession({
          id: input.sessionId,
          userId: input.userId,
        });
      }
      return input;
    },
    () => success(input),
  );
}

/**
 * Save user message to database
 */
export async function saveUserMessage(input: ChatStreamInput): Promise<void> {
  logger.debug(
    { sessionId: input.sessionId, messageLength: input.message.length },
    "Saving user message",
  );
  await chatRepository.saveMessage({
    sessionId: input.sessionId,
    role: "user",
    content: input.message,
  });
}

/**
 * Stream response from AI service and save complete response
 */
export async function* streamAndSaveResponse(
  input: ChatStreamInput,
): AsyncGenerator<string, void, unknown> {
  const chunks: string[] = [];
  const startTime = Date.now();

  try {
    // Stream from AI service
    const stream = aiServiceClient.streamChat(input.message, input.sessionId);

    for await (const chunk of stream) {
      chunks.push(chunk);
      yield chunk;
    }

    // Save complete assistant response
    const fullResponse = chunks.join("");
    const latencyMs = Date.now() - startTime;

    logger.debug(
      {
        sessionId: input.sessionId,
        responseLength: fullResponse.length,
        latencyMs,
      },
      "Saving assistant response",
    );

    await chatRepository.saveMessage({
      sessionId: input.sessionId,
      role: "assistant",
      content: fullResponse,
    });
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    logger.error(
      { sessionId: input.sessionId, error, latencyMs },
      "Chat stream failed",
    );
    throw error;
  }
}

/**
 * Check if session exists
 * Returns null if session doesn't exist
 */
export async function findSessionById(
  sessionId: string,
): Promise<{ id: string; userId: string } | null> {
  return chatRepository.findSessionById(sessionId);
}

/**
 * Get all messages for a session
 * Bridges to chatRepository
 */
export async function getSessionMessages(
  input: GetChatHistoryInput,
): Promise<GetChatHistoryResult> {
  return chatRepository.getSessionMessages(input.sessionId);
}
