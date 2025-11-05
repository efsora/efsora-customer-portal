import { matchResponse } from "#lib/result/combinators";
import { run } from "#lib/result/index";
import {
  CreateUserResult,
  LoginResult,
  createUser,
  login,
} from "#core/users/index";
import {
  createFailureResponse,
  createSuccessResponse,
  type AppResponse,
} from "#lib/types/response";
import type { ValidatedRequest } from "#middlewares/validate";

import type { RegisterBody, LoginBody } from "./schemas";

/**
 * POST /auth/register
 * Register a new user
 */
export async function handleRegister(
  req: ValidatedRequest<{ body: RegisterBody }>,
): Promise<AppResponse<CreateUserResult>> {
  const body = req.validated.body;
  const result = await run(createUser(body));

  return matchResponse(result, {
    onSuccess: (user) =>
      createSuccessResponse({
        id: user.id,
        email: user.email,
        name: user.name,
        token: user.token,
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
