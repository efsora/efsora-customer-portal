import {
  CreateUserResult,
  LoginResult,
  createUser,
  login,
} from "#core/users/index";
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

import type { LoginBody, LogoutResponse, RegisterBody } from "./schemas";

/**
 * POST /auth/register
 * Register a new user
 *
 * Returns nested structure following best practices:
 * { user: { id, email, name }, token: "..." }
 */
export async function handleRegister(
  req: ValidatedRequest<{ body: RegisterBody }>,
): Promise<AppResponse<CreateUserResult>> {
  const body = req.validated.body;
  const result = await run(createUser(body));

  return matchResponse(result, {
    onSuccess: (data) =>
      createSuccessResponse({
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          surname: data.user.surname,
        },
        token: data.token,
      }),
    onFailure: (error) => createFailureResponse(error),
  });
}

/**
 * POST /auth/login
 * Login an existing user
 */
export async function handleLogin(
  req: ValidatedRequest<{ body: LoginBody }>,
): Promise<AppResponse<LoginResult>> {
  const body = req.validated.body;
  const result = await run(login(body));

  return matchResponse(result, {
    onSuccess: (data) =>
      createSuccessResponse({
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          createdAt: data.user.createdAt,
          updatedAt: data.user.updatedAt,
        },
        token: data.token,
      }),
    onFailure: (error) => createFailureResponse(error),
  });
}

/**
 * POST /auth/logout
 * Logout the current user
 *
 * This endpoint validates that the user has a valid token (via auth middleware)
 * and deletes the session from the database, immediately invalidating the token.
 *
 * Session-based token management ensures:
 * - Immediate token invalidation on logout
 * - No need for Redis or token blacklist
 * - Production-ready security
 *
 * @param req - Authenticated request with userId from JWT and Bearer token
 * @returns Success response confirming logout
 */
export async function handleLogout(
  req: AuthenticatedRequest,
): Promise<AppResponse<LogoutResponse>> {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

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
