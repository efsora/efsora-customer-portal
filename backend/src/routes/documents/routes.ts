import { Router } from "express";
import { auth } from "#middlewares/auth";
import { validate } from "#middlewares/validate";
import { handleResult } from "#middlewares/resultHandler";
import { handleGenerateUploadUrl, handleListDocuments } from "./handlers";
import { generateUploadUrlSchema, listDocumentsSchema } from "./schemas";

const router = Router();

/**
 * @route GET /api/v1/documents
 * @desc List documents from S3 for a given company and project
 * @access Public (no authentication required for now)
 * @query companyId - Company ID
 * @query projectId - Project ID
 */
router.get(
  "/",
  validate(listDocumentsSchema),
  handleResult(handleListDocuments),
);

/**
 * @route POST /api/v1/documents/get-upload-url
 * @desc Generate a pre-signed URL for uploading a document to S3
 * @access Private
 */
router.post(
  "/get-upload-url",
  auth,
  validate(generateUploadUrlSchema),
  handleResult(handleGenerateUploadUrl),
);

export default router;
