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
