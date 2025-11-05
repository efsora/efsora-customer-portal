import { matchResponse } from "#lib/result/combinators";
import { run } from "#lib/result/index";
import {
  UserData,
  getUserById,
  getAllUsers,
} from "#core/users/index";
import {
  createFailureResponse,
  createSuccessResponse,
  type AppResponse,
} from "#lib/types/response";
import type { ValidatedRequest } from "#middlewares/validate";
import type { AuthenticatedRequest } from "#middlewares/auth";

import type { GetUserParams } from "./schemas";

/**
 * GET /users/:id
 * Get user by ID (authenticated users only, can only access own data)
 */
export async function handleGetUserById(
  req: AuthenticatedRequest & ValidatedRequest<{ params: GetUserParams }>,
): Promise<AppResponse<UserData>> {
  const { id } = req.validated.params;

  const result = await run(getUserById(id));

  return matchResponse(result, {
    onSuccess: (user) =>
      createSuccessResponse({
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }),
    onFailure: (error) => createFailureResponse(error),
  });
}

/**
 * GET /users
 * Get all users (authenticated users only)
 */
export async function handleGetAllUsers(): Promise<AppResponse<UserData[]>> {
  const result = await run(getAllUsers());

  return matchResponse(result, {
    onSuccess: (users) =>
      createSuccessResponse(
        users.map((user) => ({
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })),
      ),
    onFailure: (error) => createFailureResponse(error),
  });
}