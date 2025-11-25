/**
 * Document Input Types
 * Define input structures for document operations
 */

/**
 * Input for generating a pre-signed upload URL
 */
export type GenerateUploadUrlInput = {
  fileName: string;
  fileSize: number;
  fileType: string;
  projectId: number;
  userId: string;
};

/**
 * Input for embedding a document
 */
export type EmbedDocumentInput = {
  s3Key: string;
  projectId: number;
  userId: string;
  collectionName?: string;
};
