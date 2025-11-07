import { env } from "#infrastructure/config/env";
import { getRequestId } from "#infrastructure/logger/context";
import { logger } from "#infrastructure/logger/index";
import { errorResponse } from "#middlewares/utils/response";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

/**
 * JWT payload structure embedded in the token
 */
export type JwtPayload = {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
};

/**
 * Extended Express Request with authenticated user info
 * This type is used to indicate that a route requires authentication
 */
export type AuthenticatedRequest = Request & {
  userId?: string;
  user?: JwtPayload;
};

/**
 * Authentication middleware that verifies JWT tokens from the Authorization header
 *
 * Expected header format: `Authorization: Bearer <token>`
 *
 * On success:
 * - Attaches `req.userId` (string) - the authenticated user's ID
 * - Attaches `req.user` (JwtPayload) - full decoded JWT payload
 * - Calls next()
 *
 * On failure:
 * - Returns 401 Unauthorized with error response
 * - Does not call next()
 *
 * @example
 * ```typescript
 * // Protect a route
 * router.get("/protected", auth, handleProtected);
 *
 * // In handler
 * export async function handleProtected(req: AuthenticatedRequest) {
 *   const userId = req.userId; // Type: string
 *   const userEmail = req.user?.email; // Type: string | undefined
 * }
 * ```
 */
export function auth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  try {
    // Extract Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      logger.warn(
        {
          path: req.path,
          method: req.method,
          requestId: getRequestId(),
        },
        "Authorization header missing",
      );

      res
        .status(401)
        .json(
          errorResponse(
            "Authorization header missing. Please provide a valid JWT token.",
            "MISSING_AUTH_HEADER",
          ),
        );
      return;
    }

    // Extract Bearer token from "Bearer <token>" format
    const tokenParts = authHeader.split(" ");

    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
      logger.warn(
        {
          path: req.path,
          method: req.method,
          requestId: getRequestId(),
        },
        "Invalid Authorization header format",
      );

      res
        .status(401)
        .json(
          errorResponse(
            "Invalid Authorization header format. Expected 'Bearer <token>'.",
            "INVALID_AUTH_HEADER_FORMAT",
          ),
        );
      return;
    }

    const token = tokenParts[1];

    // Verify and decode JWT token
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    // Attach user info to request
    req.userId = payload.userId;
    req.user = payload;

    logger.debug(
      {
        userId: payload.userId,
        requestId: getRequestId(),
      },
      "User authenticated successfully",
    );

    next();
  } catch (error) {
    // Handle JWT verification errors
    let message = "Invalid or expired token";
    let errorCode = "INVALID_TOKEN";

    if (error instanceof jwt.TokenExpiredError) {
      message = "Token has expired";
      errorCode = "TOKEN_EXPIRED";
    } else if (error instanceof jwt.JsonWebTokenError) {
      message = "Invalid token";
      errorCode = "INVALID_TOKEN";
    }

    logger.warn(
      {
        path: req.path,
        method: req.method,
        requestId: getRequestId(),
        error: error instanceof Error ? error.message : String(error),
      },
      "Authentication failed",
    );

    res.status(401).json(errorResponse(message, errorCode));
  }
}
