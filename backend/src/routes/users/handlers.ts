import { matchResponse } from "#lib/result/combinators";
import { run } from "#lib/result/index";
import {
  UserData,
  ExtendedUserData,
  getUserById,
  getAllUsers,
  assignUserToCompany,
  assignUserToProject,
  assignUserRole,
  updateUserProfile,
  updateUserPassword,
} from "#core/users/index";
import {
  createFailureResponse,
  createSuccessResponse,
  type AppResponse,
} from "#lib/types/response";
import type { ValidatedRequest } from "#middlewares/validate";
import type { AuthenticatedRequest } from "#middlewares/auth";

import type {
  GetUserParams,
  AssignToCompanyBody,
  AssignToProjectBody,
  AssignRoleBody,
  UpdateProfileBody,
  UpdatePasswordBody,
} from "./schemas";

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

/**
 * POST /users/assign-company
 * Assign user to company (authenticated users only)
 */
export async function handleAssignToCompany(
  req: AuthenticatedRequest & ValidatedRequest<{ body: AssignToCompanyBody }>,
): Promise<AppResponse<ExtendedUserData>> {
  const body = req.validated.body;

  const result = await run(
    assignUserToCompany({
      userId: body.userId,
      companyId: body.companyId,
    }),
  );

  return matchResponse(result, {
    onSuccess: (user) => createSuccessResponse(user),
    onFailure: (error) => createFailureResponse(error),
  });
}

/**
 * POST /users/assign-project
 * Assign user to project (authenticated users only)
 */
export async function handleAssignToProject(
  req: AuthenticatedRequest & ValidatedRequest<{ body: AssignToProjectBody }>,
): Promise<AppResponse<ExtendedUserData>> {
  const body = req.validated.body;

  const result = await run(
    assignUserToProject({
      userId: body.userId,
      projectId: body.projectId,
    }),
  );

  return matchResponse(result, {
    onSuccess: (user) => createSuccessResponse(user),
    onFailure: (error) => createFailureResponse(error),
  });
}

/**
 * POST /users/assign-role
 * Assign role to user (authenticated users only)
 */
export async function handleAssignRole(
  req: AuthenticatedRequest & ValidatedRequest<{ body: AssignRoleBody }>,
): Promise<AppResponse<ExtendedUserData>> {
  const body = req.validated.body;

  const result = await run(
    assignUserRole({
      userId: body.userId,
      roleId: body.roleId,
    }),
  );

  return matchResponse(result, {
    onSuccess: (user) => createSuccessResponse(user),
    onFailure: (error) => createFailureResponse(error),
  });
}

/**
 * PUT /users/profile
 * Update user profile (authenticated users only)
 */
export async function handleUpdateProfile(
  req: AuthenticatedRequest & ValidatedRequest<{ body: UpdateProfileBody }>,
): Promise<AppResponse<ExtendedUserData>> {
  const body = req.validated.body;

  const result = await run(
    updateUserProfile({
      userId: body.userId,
      name: body.name,
      surname: body.surname,
      bio: body.bio,
    }),
  );

  return matchResponse(result, {
    onSuccess: (user) => createSuccessResponse(user),
    onFailure: (error) => createFailureResponse(error),
  });
}

/**
 * PUT /users/password
 * Update user password (authenticated users only)
 */
export async function handleUpdatePassword(
  req: AuthenticatedRequest & ValidatedRequest<{ body: UpdatePasswordBody }>,
): Promise<AppResponse<ExtendedUserData>> {
  const body = req.validated.body;

  const result = await run(
    updateUserPassword({
      userId: body.userId,
      currentPassword: body.currentPassword,
      newPassword: body.newPassword,
    }),
  );

  return matchResponse(result, {
    onSuccess: (user) => createSuccessResponse(user),
    onFailure: (error) => createFailureResponse(error),
  });
}
