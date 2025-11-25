import { getRequestId } from "#infrastructure/logger/context";
import { logger } from "#infrastructure/logger/index";
import { errorResponse } from "#middlewares/utils/response";
import { NextFunction, Request, Response } from "express";
/**
 * Global error handler middleware
 * Catches any unhandled errors and returns a standard error response
 * Note: Express error handlers MUST have exactly 4 parameters (err, req, res, next)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(error: Error, req: Request, res: Response, _next: NextFunction): void {
  // Log error with observability context
  logger.error(
    {
      error: error.message,
      method: req.method,
      path: req.path,
      requestId: getRequestId(),
      stack: error.stack,
    },
    "Unhandled error in request",
  );
  // Default to 500 if no status code is set
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res
    .status(statusCode)
    .json(
      errorResponse(
        error.message || "Internal server error",
        "INTERNAL_ERROR",
        process.env.NODE_ENV === "development"
          ? { stack: error.stack }
          : undefined,
      ),
    );
}
