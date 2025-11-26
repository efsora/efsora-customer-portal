import type { Response } from "express";
import type { AuthenticatedRequest } from "#middlewares/auth";
import type { ValidatedRequest } from "#middlewares/validate";
import { chatStream, getChatHistory } from "#core/chat";
import type { ChatStreamBody, ChatHistoryParams } from "./schemas";

/**
 * POST /chat/stream
 * Stream chat response via SSE
 * HTTP-level metrics tracking (chunkCount, latencyMs) kept for monitoring
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

  try {
    const stream = chatStream({ message, sessionId, userId });

    for await (const chunk of stream) {
      res.write(`data: ${chunk}\n\n`);
    }

    res.end();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // HTTP-level error response
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

  try {
    const messages = await getChatHistory({ sessionId, userId });
    res.json({ messages });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // HTTP-level error response
    if (errorMessage.includes("Forbidden")) {
      res.status(403).json({ error: "Access denied" });
    } else {
      res.status(500).json({ error: errorMessage });
    }
  }
}
