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
 * Input for listing documents in a project
 */
export type ListDocumentsInput = {
  companyId: number;
  projectId: number;
};
