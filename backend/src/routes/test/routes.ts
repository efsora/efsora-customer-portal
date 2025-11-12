import { Router } from "express";
import { validate } from "#middlewares/validate";
import { handleResult } from "#middlewares/resultHandler";
import { handleTestCleanup, handleCleanupAllTestUsers } from "./handlers";
import { cleanupSchema, cleanupAllSchema } from "./schemas";

const router = Router();

/**
 * DELETE /test/cleanup
 * Clean up specific test users by user IDs (development only)
 * Body: { userIds: string[] }
 */
router.delete(
  "/cleanup",
  validate(cleanupSchema),
  handleResult(handleTestCleanup),
);

/**
 * DELETE /test/cleanup-all
 * Clean up all test users by email patterns (development only)
 * Body: { emailPatterns: string[] }
 */
router.delete(
  "/cleanup-all",
  validate(cleanupAllSchema),
  handleResult(handleCleanupAllTestUsers),
);

export default router;
