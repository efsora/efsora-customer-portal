/**
 * Document Output Types
 * Define output structures for document operations
 */

/**
 * Result for generate upload URL operation
 */
export type GenerateUploadUrlResult = {
  uploadUrl: string;
  expiresIn: number;
};

/**
 * Document status type
 */
export type DocumentStatus = "signed" | "inProgress" | "paid" | "sent";

/**
 * Document category type
 */
export type DocumentCategory = "SoW" | "Legal" | "Billing" | "Assets";

/**
 * File name with icon (matches FileRow.fileName)
 */
export type DocumentFileName = {
  name: string;
  icon: string;
};

/**
 * Uploader info (matches FileRow.uploader)
 */
export type DocumentUploader = {
  name: string;
  icon: string;
};

/**
 * Document row matching frontend FileRow interface (without version)
 */
export type DocumentRow = {
  id: string;
  fileName: DocumentFileName;
  uploader: DocumentUploader;
  lastUpdated: string;
  dateCreated: string;
  status: DocumentStatus;
  category: DocumentCategory;
};

/**
 * Result for list documents operation
 */
export type ListDocumentsResult = {
  documents: DocumentRow[];
};
