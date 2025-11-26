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

/**
 * Result type for embed document streaming operation
 * This is an async generator that yields string chunks (SSE data)
 */
export type EmbedDocumentStreamResult = AsyncGenerator<string, void, unknown>;
