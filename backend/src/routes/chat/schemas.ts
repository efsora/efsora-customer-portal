import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

/**
 * Chat stream request body schema
 * SECURITY: Message length limited to 4000 chars to prevent DOS
 */
export const chatStreamBodySchema = z
  .object({
    message: z
      .string()
      .min(1, "Message cannot be empty")
      .max(4000, "Message too long (max 4000 characters)")
      .trim()
      .openapi({ example: "What is Efsora?" }),
    sessionId: z.uuid().openapi({
      example: "550e8400-e29b-41d4-a716-446655440000",
    }),
  })
  .openapi("ChatStreamBody");

export type ChatStreamBody = z.infer<typeof chatStreamBodySchema>;

/**
 * Chat history path parameter schema
 */
export const chatHistoryParamsSchema = z
  .object({
    sessionId: z.uuid(),
  })
  .openapi("ChatHistoryParams");

export type ChatHistoryParams = z.infer<typeof chatHistoryParamsSchema>;
