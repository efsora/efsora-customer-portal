/**
 * Document Input Types
 * Define input structures for document operations
 */

import type { DocumentCategory } from "./outputs";

/**
 * Input for generating a pre-signed upload URL
 */
export type GenerateUploadUrlInput = {
  fileName: string;
  fileSize: number;
  fileType: string;
  projectId: number;
  userId: string;
  category: DocumentCategory;
};

/**
 * Input for listing documents in a project
 */
export type ListDocumentsInput = {
  companyId: number;
  projectId: number;
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
