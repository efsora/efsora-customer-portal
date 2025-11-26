import { Router } from "express";
import { auth } from "#middlewares/auth";
import { validate } from "#middlewares/validate";
import { handleSSE } from "#middlewares/sseHandler";
import { handleResult } from "#middlewares/resultHandler";
import { handleChatStream, handleGetChatHistory } from "./handlers";
import { chatStreamBodySchema, chatHistoryParamsSchema } from "./schemas";

const router = Router();

/**
 * POST /api/v1/chat/stream
 * Stream chat response (protected, requires authentication)
 */
router.post(
  "/stream",
  auth,
  validate({ body: chatStreamBodySchema }),
  handleSSE(handleChatStream),
);

/**
 * GET /api/v1/chat/sessions/:sessionId/messages
 * Get chat history (protected, requires authentication)
 */
router.get(
  "/sessions/:sessionId/messages",
  auth,
  validate({ params: chatHistoryParamsSchema }),
  handleResult(handleGetChatHistory),
);

export default router;
