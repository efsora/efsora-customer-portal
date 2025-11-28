import type { Response } from "express";
import type { AuthenticatedRequest } from "#middlewares/auth";
import type { ValidatedRequest } from "#middlewares/validate";
import {
  createSuccessResponse,
  createFailureResponse,
  type AppResponse,
} from "#lib/types/response";
import { run } from "#lib/result";
import { validateChatSession, getChatHistory, type ChatMessage } from "#core/chat";
import { chatRepository } from "#infrastructure/repositories/drizzle";
import { aiServiceClient } from "#infrastructure/ai-service";
import { logger } from "#infrastructure/logger";
import type { ChatStreamBody, ChatHistoryParams } from "./schemas";

/**
 * POST /chat/stream
 * Stream chat response via SSE
 *
 * FCIS COMPLIANT - IMPERATIVE SHELL:
 * - Calls run() to execute validation workflow
 * - Handles all I/O operations directly (streaming, saving messages)
 * - Owns the streaming lifecycle
 */
export async function handleChatStream(
  req: AuthenticatedRequest & ValidatedRequest<{ body: ChatStreamBody }>,
  res: Response,
): Promise<void> {
  const { message, sessionId } = req.validated.body;
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  // 1. EXECUTE WORKFLOW - Validate session (run() in handler ✅)
  const validationResult = await run(
    validateChatSession({ message, sessionId, userId }),
  );

  if (validationResult.status === "Failure") {
    const errorCode = validationResult.error.code;
    if (errorCode === "USER_FORBIDDEN") {
      res.write(`data: [Error] Access denied\n\n`);
    } else {
      res.write(`data: [Error] ${validationResult.error.message}\n\n`);
    }
    res.end();
    return;
  }

  // After run() and Failure check, result is always Success (Command is fully evaluated by run())
  if (validationResult.status !== "Success") {
    // This should never happen - run() always returns Success or Failure
    res.write(`data: [Error] Unexpected result state\n\n`);
    res.end();
    return;
  }

  const validatedSession = validationResult.value;

  logger.info(
    {
      sessionId,
      userId,
      isNewSession: validatedSession.isNewSession,
    },
    "Chat session validated, starting stream",
  );

  // 2. SAVE USER MESSAGE (imperative I/O in handler ✅)
  try {
    await chatRepository.saveMessage({
      sessionId,
      role: "user",
      content: message,
    });
    logger.debug(
      { sessionId, messageLength: message.length },
      "User message saved",
    );
  } catch (error) {
    logger.error({ sessionId, error }, "Failed to save user message");
    res.write(`data: [Error] Failed to save message\n\n`);
    res.end();
    return;
  }

  // 3. STREAM AI RESPONSE (imperative I/O in handler ✅)
  const chunks: string[] = [];
  const startTime = Date.now();

  try {
    const stream = aiServiceClient.streamChat(message, sessionId);

    for await (const chunk of stream) {
      chunks.push(chunk);
      res.write(`data: ${chunk}\n\n`);
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const latencyMs = Date.now() - startTime;
    logger.error({ sessionId, error, latencyMs }, "Chat stream failed");
    res.write(`data: [Error] ${errorMessage}\n\n`);
    res.end();
    return;
  }

  // 4. SAVE ASSISTANT RESPONSE (imperative I/O in handler ✅)
  try {
    const fullResponse = chunks.join("");
    const latencyMs = Date.now() - startTime;

    await chatRepository.saveMessage({
      sessionId,
      role: "assistant",
      content: fullResponse,
    });

    logger.info(
      { sessionId, responseLength: fullResponse.length, latencyMs },
      "Chat stream completed",
    );
  } catch (error) {
    logger.error({ sessionId, error }, "Failed to save assistant response");
    // Don't fail the request - user already received the response
  }

  res.end();
}

/**
 * GET /chat/sessions/:sessionId/messages
 * Get chat history for a session
 *
 * FCIS COMPLIANT - IMPERATIVE SHELL:
 * - Calls run() to execute workflow
 * - Uses matchResponse for clean result handling
 */
export async function handleGetChatHistory(
  req: AuthenticatedRequest & ValidatedRequest<{ params: ChatHistoryParams }>,
): Promise<AppResponse<{ messages: ChatMessage[] }>> {
  const { sessionId } = req.validated.params;
  const userId = req.user?.userId;

  if (!userId) {
    return createFailureResponse({
      code: "UNAUTHORIZED",
      message: "User not authenticated",
    });
  }

  // Execute workflow with run() ✅
  const result = await run(getChatHistory({ sessionId, userId }));

  if (result.status === "Failure") {
    return createFailureResponse(result.error);
  }

  // After run() and Failure check, result is always Success
  if (result.status !== "Success") {
    return createFailureResponse({
      code: "INTERNAL_ERROR",
      message: "Unexpected result state",
    });
  }

  return createSuccessResponse({ messages: result.value });
}
