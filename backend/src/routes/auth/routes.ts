import { handleResult } from "#middlewares/resultHandler";
import { validate } from "#middlewares/validate";
import { auth } from "#middlewares/auth";
import { Router } from "express";

import {
  handleRegister,
  handleLogin,
  handleLogout,
  handleSendInvitation,
} from "./handlers";
import {
  registerSchema,
  loginSchema,
  sendInvitationBodySchema,
} from "./schemas";

const router = Router();

/**
 * POST /auth/register
 * Register a new user (public endpoint - no authentication required)
 */
router.post(
  "/register",
  validate(registerSchema),
  handleResult(handleRegister),
);

/**
 * POST /auth/login
 * Login a user (public endpoint - no authentication required)
 * Returns user data + JWT token on success
 */
router.post("/login", validate(loginSchema), handleResult(handleLogin));

/**
 * POST /auth/logout
 * Logout the current user (protected endpoint - requires valid JWT token)
 * Returns success response - client should clear token from storage
 */
router.post("/logout", auth, handleResult(handleLogout));

/**
 * POST /auth/send-invitation
 * Send a portal invitation to a user (public endpoint - no authentication required)
 * Creates a PENDING invitation record with 48-hour expiration
 * TODO: Add email sending functionality
 */
router.post(
  "/send-invitation",
  validate({ body: sendInvitationBodySchema }),
  handleResult(handleSendInvitation),
);

export default router;
