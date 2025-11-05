import { handleResult } from "#middlewares/resultHandler";
import { validate } from "#middlewares/validate";
import { Router } from "express";

import { handleRegister, handleLogin } from "./handlers";
import { registerSchema, loginSchema } from "./schemas";

const router = Router();

/**
 * POST /auth/register
 * Register a new user (public endpoint - no authentication required)
 */
router.post("/register", validate(registerSchema), handleResult(handleRegister));

/**
 * POST /auth/login
 * Login a user (public endpoint - no authentication required)
 * Returns user data + JWT token on success
 */
router.post("/login", validate(loginSchema), handleResult(handleLogin));

export default router;
