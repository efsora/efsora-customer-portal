import type { Response } from "express";
import type { AuthenticatedRequest } from "#middlewares/auth";
import type { ValidatedRequest } from "#middlewares/validate";
import { logger } from "#infrastructure/logger";
import { chatStream, getChatHistory } from "#core/chat";
import type { ChatStreamBody, ChatHistoryParams } from "./schemas";

/**
 * POST /chat/stream
 * Stream chat response via SSE with monitoring
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
  const startTime = Date.now();
  let chunkCount = 0;
  let totalChars = 0;

  logger.info(
    { userId, sessionId, messageLength: message.length },
    "Chat stream request started",
  );

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  try {
    const stream = chatStream({ message, sessionId, userId });

    for await (const chunk of stream) {
      res.write(`data: ${chunk}\n\n`);
      chunkCount++;
      totalChars += chunk.length;
    }

    const latencyMs = Date.now() - startTime;

    // Monitor successful completion
    logger.info(
      {
        userId,
        sessionId,
        chunkCount,
        totalChars,
        latencyMs,
        status: "success",
      },
      "Chat stream completed successfully",
    );

    res.end();
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // Monitor error with context
    logger.error(
      {
        error,
        userId,
        sessionId,
        chunkCount,
        totalChars,
        latencyMs,
        status: "error",
        errorMessage,
      },
      "Chat stream failed",
    );

    // Send error to client
    if (errorMessage.includes("Forbidden")) {
      res.write(`data: [Error] Access denied\n\n`);
    } else {
      res.write(`data: [Error] ${errorMessage}\n\n`);
    }
    res.end();
  }
}

/**
 * GET /chat/sessions/:sessionId/messages
 * Get chat history for a session
 */
export async function handleGetChatHistory(
  req: AuthenticatedRequest & ValidatedRequest<{ params: ChatHistoryParams }>,
  res: Response,
): Promise<void> {
  const { sessionId } = req.validated.params;
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const startTime = Date.now();

  logger.info({ userId, sessionId }, "Chat history request");

  try {
    const messages = await getChatHistory(sessionId, userId);
    const latencyMs = Date.now() - startTime;

    logger.info(
      { userId, sessionId, messageCount: messages.length, latencyMs },
      "Chat history retrieved",
    );

    res.json({ messages });
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    logger.error(
      { error, userId, sessionId, latencyMs, errorMessage },
      "Chat history retrieval failed",
    );

    if (errorMessage.includes("Forbidden")) {
      res.status(403).json({ error: "Access denied" });
    } else {
      res.status(500).json({ error: errorMessage });
    }
  }
}
