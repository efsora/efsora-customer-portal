/**
 * S3 Infrastructure
 *
 * AWS S3 client and utilities for document storage
 */

export {
  generatePresignedUploadUrl,
  buildDocumentKey,
  buildDocumentPrefix,
  listObjects,
  getObjectMetadata,
  type GenerateUploadUrlParams,
  type GenerateUploadUrlResult,
  type ListObjectsParams,
  type ListObjectsResult,
  type S3ObjectInfo,
} from "./client.js";
