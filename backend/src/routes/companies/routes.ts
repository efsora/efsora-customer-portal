import { handleResult } from "#middlewares/resultHandler";
import { validate } from "#middlewares/validate";
import { auth } from "#middlewares/auth";
import { Router } from "express";

import {
  handleCreateCompany,
  handleGetCompanyById,
  handleGetAllCompanies,
  handleUpdateCompany,
  handleDeleteCompany,
} from "./handlers";
import {
  createCompanySchema,
  getCompanyByIdSchema,
  getAllCompaniesSchema,
  updateCompanySchema,
  deleteCompanySchema,
} from "./schemas";

const router = Router();

/**
 * POST /companies
 * Create a new company (protected)
 */
router.post(
  "/",
  auth,
  validate(createCompanySchema),
  handleResult(handleCreateCompany),
);

/**
 * GET /companies/:id
 * Get company by ID (protected)
 */
router.get(
  "/:id",
  auth,
  validate(getCompanyByIdSchema),
  handleResult(handleGetCompanyById),
);

/**
 * GET /companies
 * Get all companies (protected)
 */
router.get(
  "/",
  auth,
  validate(getAllCompaniesSchema),
  handleResult(handleGetAllCompanies),
);

/**
 * PUT /companies/:id
 * Update company (protected)
 */
router.put(
  "/:id",
  auth,
  validate(updateCompanySchema),
  handleResult(handleUpdateCompany),
);

/**
 * DELETE /companies/:id
 * Delete company (protected)
 */
router.delete(
  "/:id",
  auth,
  validate(deleteCompanySchema),
  handleResult(handleDeleteCompany),
);

export default router;
