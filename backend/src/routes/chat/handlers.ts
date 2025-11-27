import type { Response } from "express";
import type { AuthenticatedRequest } from "#middlewares/auth";
import type { ValidatedRequest } from "#middlewares/validate";
import {
  createSuccessResponse,
  createFailureResponse,
  type AppResponse,
} from "#lib/types/response";
import { chatStream, getChatHistory, type ChatMessage } from "#core/chat";
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
): Promise<AppResponse<{ messages: ChatMessage[] }>> {
  const { sessionId } = req.validated.params;
  const userId = req.user?.userId;

  if (!userId) {
    return createFailureResponse({
      code: "UNAUTHORIZED",
      message: "User not authenticated",
    });
  }

  try {
    const messages = await getChatHistory({ sessionId, userId });
    return createSuccessResponse({ messages });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    if (errorMessage.includes("Forbidden")) {
      return createFailureResponse({
        code: "USER_FORBIDDEN",
        message: "Access denied",
      });
    }

    return createFailureResponse({
      code: "INTERNAL_ERROR",
      message: errorMessage,
    });
  }
}
