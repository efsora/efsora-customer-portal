/**
 * SSE Handler Middleware
 *
 * Wrapper middleware for Server-Sent Events (SSE) streaming handlers.
 * Provides type-safe handling of SSE requests with custom request types.
 */

import type { NextFunction, Request, Response } from "express";

/**
 * Type for handlers that handle SSE streaming
 *
 * These handlers return Promise<void> because they write directly to the response
 * stream rather than returning a JSON response.
 *
 * Generic type R allows handlers to specify their request type (e.g., AuthenticatedRequest & ValidatedRequest).
 */
export type SSEHandler<R extends Request = Request> = (
  req: R,
  res: Response,
) => Promise<void>;

/**
 * Wrapper middleware for SSE streaming handlers
 *
 * This middleware provides type-safe wrapping for handlers that:
 * - Use custom request types (AuthenticatedRequest, ValidatedRequest, etc.)
 * - Write directly to the response stream (SSE)
 * - Return Promise<void> instead of AppResponse<T>
 *
 * Handler Style:
 * ```ts
 * export async function handleChatStream(
 *   req: AuthenticatedRequest & ValidatedRequest<{ body: ChatStreamBody }>,
 *   res: Response,
 * ): Promise<void> {
 *   // Set SSE headers
 *   res.setHeader("Content-Type", "text/event-stream");
 *   res.setHeader("Cache-Control", "no-cache");
 *   res.setHeader("Connection", "keep-alive");
 *   res.flushHeaders();
 *
 *   // Stream data
 *   for await (const chunk of stream) {
 *     res.write(`data: ${chunk}\n\n`);
 *   }
 *   res.end();
 * }
 * ```
 *
 * Route Usage:
 * ```ts
 * router.post("/stream", auth, validate(schema), handleSSE(handleChatStream));
 * ```
 *
 * @param handler - SSE handler function that writes to response stream
 * @returns Express middleware function
 */
export function handleSSE<R extends Request = Request>(handler: SSEHandler<R>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req as R, res);
    } catch (error) {
      // If headers haven't been sent, pass to error handler
      if (!res.headersSent) {
        next(error);
      } else {
        // Headers already sent (SSE started), try to send error through stream
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        res.write(`data: [Error] ${errorMessage}\n\n`);
        res.end();
      }
    }
  };
}
