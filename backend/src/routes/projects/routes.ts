import { Router } from "express";
import { auth } from "#middlewares/auth";
import { validate } from "#middlewares/validate";
import { handleResult } from "#middlewares/resultHandler";
import {
  handleCreateProject,
  handleGetProjectById,
  handleGetAllProjects,
  handleUpdateProject,
  handleDeleteProject,
  handleGetYourTeam,
} from "./handlers";
import {
  createProjectSchema,
  getProjectByIdSchema,
  getAllProjectsSchema,
  updateProjectSchema,
  deleteProjectSchema,
  getYourTeamSchema,
} from "./schemas";

const router = Router();

/**
 * @route POST /api/v1/projects
 * @desc Create a new project
 * @access Private
 */
router.post(
  "/",
  auth,
  validate(createProjectSchema),
  handleResult(handleCreateProject),
);

/**
 * @route GET /api/v1/projects/team
 * @desc Get team members for a project (customer and efsora teams)
 * @access Private
 */
router.get(
  "/team",
  auth,
  validate(getYourTeamSchema),
  handleResult(handleGetYourTeam),
);

/**
 * @route GET /api/v1/projects/:id
 * @desc Get a single project by ID
 * @access Private
 */
router.get(
  "/:id",
  auth,
  validate(getProjectByIdSchema),
  handleResult(handleGetProjectById),
);

/**
 * @route GET /api/v1/projects
 * @desc Get all projects (optionally filtered by company)
 * @access Private
 */
router.get(
  "/",
  auth,
  validate(getAllProjectsSchema),
  handleResult(handleGetAllProjects),
);

/**
 * @route PATCH /api/v1/projects/:id
 * @desc Update a project
 * @access Private
 */
router.patch(
  "/:id",
  auth,
  validate(updateProjectSchema),
  handleResult(handleUpdateProject),
);

/**
 * @route DELETE /api/v1/projects/:id
 * @desc Delete a project
 * @access Private
 */
router.delete(
  "/:id",
  auth,
  validate(deleteProjectSchema),
  handleResult(handleDeleteProject),
);

export default router;
