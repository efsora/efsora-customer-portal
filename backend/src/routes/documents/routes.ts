import { Router } from "express";
import { auth } from "#middlewares/auth";
import { validate } from "#middlewares/validate";
import { handleResult } from "#middlewares/resultHandler";
import { handleGenerateUploadUrl } from "./handlers";
import { generateUploadUrlSchema } from "./schemas";

const router = Router();

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
