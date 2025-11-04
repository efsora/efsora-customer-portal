import { handleResult } from "#middlewares/resultHandler";
import { validate } from "#middlewares/validate";
import { Router } from "express";

import { handleCreateUser, handleGetUserById, handleGetAllUsers } from "./handlers";
import { createUserSchema, getUserSchema, getAllUsersSchema } from "./schemas";

const router = Router();

/**
 * POST /users
 * Create a new user (public endpoint - no authentication required)
 */
router.post("/", validate(createUserSchema), handleResult(handleCreateUser));

/**
 * GET /users/:id
 * Get user by ID (protected endpoint - authentication required)
 * Users can only access their own data
 */
router.get("/:id", validate(getUserSchema), handleResult(handleGetUserById));

/**
 * GET /users
 * Get all users (protected endpoint - authentication required)
 */
router.get("/", validate(getAllUsersSchema), handleResult(handleGetAllUsers));

export default router;
