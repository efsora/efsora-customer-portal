import { Router, type RequestHandler } from "express";
import { auth } from "#middlewares/auth";
import { validate } from "#middlewares/validate";
import { handleResult } from "#middlewares/resultHandler";
import { handleGenerateUploadUrl, handleEmbedDocument } from "./handlers";
import { generateUploadUrlSchema, embedDocumentSchema } from "./schemas";

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

/**
 * @route POST /api/v1/documents/embed
 * @desc Embed a document from S3 into vector database (proxies SSE from AI service)
 * @access Private
 */
router.post(
  "/embed",
  auth,
  validate(embedDocumentSchema),
  handleEmbedDocument as unknown as RequestHandler,
);

export default router;
