/**
 * S3 Infrastructure
 *
 * AWS S3 client and utilities for document storage
 */

export {
  generatePresignedUploadUrl,
  buildDocumentKey,
  type GenerateUploadUrlParams,
  type GenerateUploadUrlResult,
} from "./client.js";
