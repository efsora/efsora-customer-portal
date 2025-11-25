/**
 * Document Output Types
 * Define output structures for document operations
 */

/**
 * Result for generate upload URL operation
 */
export type GenerateUploadUrlResult = {
  uploadUrl: string;
  s3Key: string;
  expiresIn: number;
};
