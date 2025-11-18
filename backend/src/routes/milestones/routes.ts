import { handleResult } from "#middlewares/resultHandler";
import { validate } from "#middlewares/validate";
import { auth } from "#middlewares/auth";
import { Router } from "express";

import {
  handleCreateMilestone,
  handleGetMilestoneById,
  handleGetAllMilestones,
  handleUpdateMilestone,
  handleDeleteMilestone,
} from "./handlers";
import {
  createMilestoneSchema,
  getMilestoneByIdSchema,
  getAllMilestonesSchema,
  updateMilestoneSchema,
  deleteMilestoneSchema,
} from "./schemas";

const router = Router();

/**
 * POST /milestones
 * Create a new milestone (protected)
 */
router.post(
  "/",
  auth,
  validate(createMilestoneSchema),
  handleResult(handleCreateMilestone),
);

/**
 * GET /milestones/:id
 * Get milestone by ID (protected)
 */
router.get(
  "/:id",
  auth,
  validate(getMilestoneByIdSchema),
  handleResult(handleGetMilestoneById),
);

/**
 * GET /milestones
 * Get all milestones (protected)
 */
router.get(
  "/",
  auth,
  validate(getAllMilestonesSchema),
  handleResult(handleGetAllMilestones),
);

/**
 * PUT /milestones/:id
 * Update milestone (protected)
 */
router.put(
  "/:id",
  auth,
  validate(updateMilestoneSchema),
  handleResult(handleUpdateMilestone),
);

/**
 * DELETE /milestones/:id
 * Delete milestone (protected)
 */
router.delete(
  "/:id",
  auth,
  validate(deleteMilestoneSchema),
  handleResult(handleDeleteMilestone),
);

export default router;
