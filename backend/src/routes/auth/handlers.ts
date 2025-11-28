import {
  CreateUserResult,
  LoginResult,
  SendInvitationResult,
  createUser,
  login,
  sendInvitation,
} from "#core/users/index";
import {
  AUTH_COOKIE_NAME,
  clearAuthCookie,
  setAuthCookie,
} from "#infrastructure/auth/index";
import { getRequestId } from "#infrastructure/logger/context";
import { logger } from "#infrastructure/logger/index";
import { sessionRepository } from "#infrastructure/repositories/drizzle";
import { matchResponse } from "#lib/result/combinators";
import { run } from "#lib/result/index";
import {
  createFailureResponse,
  createSuccessResponse,
  type AppResponse,
} from "#lib/types/response";
import type { AuthenticatedRequest } from "#middlewares/auth";
import type { ValidatedRequest } from "#middlewares/validate";
import type { Response } from "express";

import type {
  LoginBody,
  LogoutResponse,
  RegisterBody,
  SendInvitationBody,
} from "./schemas";

/** Response type for register (user only, no token) */
type RegisterResponse = { user: CreateUserResult["user"] };

/**
 * POST /auth/register
 * Register a new user
 *
 * Sets JWT in httpOnly cookie for security (XSS protection).
 * Returns user data only - token is not exposed in response body.
 */
export async function handleRegister(
  req: ValidatedRequest<{ body: RegisterBody }>,
  res: Response,
): Promise<AppResponse<RegisterResponse>> {
  const body = req.validated.body;
  const result = await run(createUser(body));

  if (result.status === "Failure") {
    return createFailureResponse(result.error);
  }

  if (result.status !== "Success") {
    // This should never happen after run(), but TypeScript needs it
    return createFailureResponse({
      code: "INTERNAL_ERROR",
      message: "Unexpected result state",
    });
  }

  // Set JWT in httpOnly cookie
  setAuthCookie(res, result.value.token);

  // Return user data only (token is in cookie)
  return createSuccessResponse({
    user: {
      id: result.value.user.id,
      email: result.value.user.email,
      name: result.value.user.name,
      surname: result.value.user.surname,
    },
  });
}

/** Response type for login (user only, no token) */
type LoginResponse = { user: LoginResult["user"] };

/**
 * POST /auth/login
 * Login an existing user
 *
 * Sets JWT in httpOnly cookie for security (XSS protection).
 * Returns user data only - token is not exposed in response body.
 */
export async function handleLogin(
  req: ValidatedRequest<{ body: LoginBody }>,
  res: Response,
): Promise<AppResponse<LoginResponse>> {
  const body = req.validated.body;
  const result = await run(login(body));

  if (result.status === "Failure") {
    return createFailureResponse(result.error);
  }

  if (result.status !== "Success") {
    // This should never happen after run(), but TypeScript needs it
    return createFailureResponse({
      code: "INTERNAL_ERROR",
      message: "Unexpected result state",
    });
  }

  // Set JWT in httpOnly cookie
  setAuthCookie(res, result.value.token);

  // Return user data only (token is in cookie)
  return createSuccessResponse({
    user: {
      id: result.value.user.id,
      email: result.value.user.email,
      name: result.value.user.name,
      surname: result.value.user.surname,
      createdAt: result.value.user.createdAt,
      updatedAt: result.value.user.updatedAt,
      projectId: result.value.user.projectId,
      companyId: result.value.user.companyId,
    },
  });
}

/**
 * POST /auth/logout
 * Logout the current user
 *
 * This endpoint validates that the user has a valid token (via auth middleware)
 * and deletes the session from the database, immediately invalidating the token.
 * Also clears the httpOnly auth cookie.
 *
 * Session-based token management ensures:
 * - Immediate token invalidation on logout
 * - No need for Redis or token blacklist
 * - Production-ready security
 *
 * @param req - Authenticated request with userId from JWT
 * @param res - Express response for clearing cookie
 * @returns Success response confirming logout
 */
export async function handleLogout(
  req: AuthenticatedRequest,
  res: Response,
): Promise<AppResponse<LogoutResponse>> {
  try {
    // Get token from cookie (primary) or Authorization header (fallback for backwards compat)
    const token =
      req.cookies?.[AUTH_COOKIE_NAME] || req.headers.authorization?.split(" ")[1];

    if (!token) {
      logger.warn(
        {
          userId: req.userId,
          requestId: getRequestId(),
        },
        "Logout attempted without token",
      );
      return createFailureResponse({
        code: "UNAUTHORIZED",
        message: "No token provided",
      });
    }

    // Delete session from database
    const deletedSessions = await sessionRepository.deleteByToken(token);

    // Clear the auth cookie
    clearAuthCookie(res);

    if (deletedSessions.length === 0) {
      logger.warn(
        {
          userId: req.userId,
          requestId: getRequestId(),
        },
        "Session not found during logout",
      );
      // Still return success - user wanted to logout anyway
    } else {
      logger.info(
        {
          userId: req.userId,
          sessionId: deletedSessions[0].id,
          requestId: getRequestId(),
        },
        "User logged out successfully, session deleted",
      );
    }

    return createSuccessResponse({
      message: "Logged out successfully",
    });
  } catch (error) {
    logger.error(
      {
        userId: req.userId,
        requestId: getRequestId(),
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to logout user",
    );

    return createFailureResponse({
      code: "INTERNAL_ERROR",
      message: "Failed to logout. Please try again.",
    });
  }
}

/**
 * POST /auth/send-invitation
 * Send a portal invitation to a user
 *
 * Creates a PENDING invitation record with 48-hour expiration.
 * Email sending will be implemented in the future.
 *
 * @param req - Request with email in body
 * @returns Success response with invitation details
 */
export async function handleSendInvitation(
  req: ValidatedRequest<{ body: SendInvitationBody }>,
): Promise<AppResponse<SendInvitationResult>> {
  const body = req.validated.body;
  const result = await run(sendInvitation(body));

  return matchResponse(result, {
    onSuccess: (data) =>
      createSuccessResponse({
        email: data.email,
        status: data.status,
        dueDate: data.dueDate,
        message: data.message,
      }),
    onFailure: (error) => createFailureResponse(error),
  });
}
