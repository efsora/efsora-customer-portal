import { handleResult } from "#middlewares/resultHandler";
import { validate } from "#middlewares/validate";
import { auth } from "#middlewares/auth";
import { Router } from "express";

import {
  handleGetUserById,
  handleGetAllUsers,
  handleAssignToCompany,
  handleAssignToProject,
  handleAssignRole,
  handleUpdateProfile,
  handleUpdatePassword,
} from "./handlers";
import {
  getUserSchema,
  getAllUsersSchema,
  assignToCompanySchema,
  assignToProjectSchema,
  assignRoleSchema,
  updateProfileSchema,
  updatePasswordSchema,
} from "./schemas";

const router = Router();

/**
 * GET /users/:id
 * Get user by ID (protected endpoint - authentication required)
 * Users can only access their own data
 */
router.get(
  "/:id",
  auth,
  validate(getUserSchema),
  handleResult(handleGetUserById),
);

/**
 * GET /users
 * Get all users (protected endpoint - authentication required)
 */
router.get(
  "/",
  auth,
  validate(getAllUsersSchema),
  handleResult(handleGetAllUsers),
);

/**
 * POST /users/assign-company
 * Assign user to company (protected endpoint - authentication required)
 */
router.post(
  "/assign-company",
  auth,
  validate(assignToCompanySchema),
  handleResult(handleAssignToCompany),
);

/**
 * POST /users/assign-project
 * Assign user to project (protected endpoint - authentication required)
 */
router.post(
  "/assign-project",
  auth,
  validate(assignToProjectSchema),
  handleResult(handleAssignToProject),
);

/**
 * POST /users/assign-role
 * Assign role to user (protected endpoint - authentication required)
 */
router.post(
  "/assign-role",
  auth,
  validate(assignRoleSchema),
  handleResult(handleAssignRole),
);

/**
 * PUT /users/profile
 * Update user profile (protected endpoint - authentication required)
 */
router.put(
  "/profile",
  auth,
  validate(updateProfileSchema),
  handleResult(handleUpdateProfile),
);

/**
 * PUT /users/password
 * Update user password (protected endpoint - authentication required)
 */
router.put(
  "/password",
  auth,
  validate(updatePasswordSchema),
  handleResult(handleUpdatePassword),
);

export default router;
