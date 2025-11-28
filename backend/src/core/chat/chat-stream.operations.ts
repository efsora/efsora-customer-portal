import { command, success, fail } from "#lib/result/factories";
import type { Result } from "#lib/result/types";
import { chatRepository } from "#infrastructure/repositories/drizzle";
import type { ChatStreamInput } from "./types/inputs";
import type {
  GetChatHistoryResult,
  ValidateChatSessionResult,
} from "./types/outputs";
import { logger } from "#infrastructure/logger";

/**
 * Internal type for session with isNewSession flag
 */
type SessionValidatedInput = ChatStreamInput & { isNewSession: boolean };

/**
 * Validate session ownership - ensures user can only access their own sessions
 * SECURITY: Critical validation to prevent unauthorized session access
 *
 * FCIS: Returns Result<T>, no direct I/O execution
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
        return { authorized: false as const, input: null };
      }

      return { authorized: true as const, input };
    },
    (result) => {
      if (!result.authorized) {
        return fail({
          code: "USER_FORBIDDEN",
          message: "Session access denied",
        });
      }
      return success(result.input);
    },
  );
}

/**
 * Ensure chat session exists, create if not
 * Only creates if session doesn't exist (after ownership validation)
 *
 * FCIS: Returns Result<T> with isNewSession flag for downstream use
 */
export function ensureSessionExists(
  input: ChatStreamInput,
): Result<SessionValidatedInput> {
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
        return { ...input, isNewSession: true };
      }
      return { ...input, isNewSession: false };
    },
    (result) => success(result),
  );
}

/**
 * Map validated session input to result type
 *
 * FCIS: Pure transformation, returns Result<T>
 */
export function mapToValidatedSession(
  input: SessionValidatedInput,
): Result<ValidateChatSessionResult> {
  return success({
    sessionId: input.sessionId,
    userId: input.userId,
    message: input.message,
    isNewSession: input.isNewSession,
  });
}

/**
 * Get chat history messages operation
 * Wraps repository call in Result for FCIS compliance
 *
 * FCIS: Returns Result<T>, defers I/O execution to run()
 */
export function getChatHistoryMessages(
  input: ChatStreamInput,
): Result<GetChatHistoryResult> {
  return command(
    async () => {
      const session = await chatRepository.findSessionById(input.sessionId);
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (session === null) {
        // Return empty array for non-existent sessions (not an error)
        return [];
      }
      return chatRepository.getSessionMessages(input.sessionId);
    },
    (messages) => success(messages),
  );
}
