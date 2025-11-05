import { handleResult } from "#middlewares/resultHandler";
import { validate } from "#middlewares/validate";
import { auth } from "#middlewares/auth";
import { Router } from "express";

import { handleGetUserById, handleGetAllUsers } from "./handlers";
import { getUserSchema, getAllUsersSchema } from "./schemas";

const router = Router();

/**
 * GET /users/:id
 * Get user by ID (protected endpoint - authentication required)
 * Users can only access their own data
 */
router.get("/:id", auth, validate(getUserSchema), handleResult(handleGetUserById));

/**
 * GET /users
 * Get all users (protected endpoint - authentication required)
 */
router.get("/", auth, validate(getAllUsersSchema), handleResult(handleGetAllUsers));

export default router;
