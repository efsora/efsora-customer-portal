/**
 * Documents Module
 * Public API for document operations
 */

// Workflows
export { generateUploadUrl } from "./workflows/generate-upload-url";
export { embedDocument } from "./workflows/embed-document";
export { listDocuments } from "./workflows/list-documents";

// Public types - Inputs
export type {
  GenerateUploadUrlInput,
  EmbedDocumentInput,
  ListDocumentsInput,
} from "./types/inputs";

// Public types - Outputs
export type {
  GenerateUploadUrlResult,
  ListDocumentsResult,
  DocumentRow,
  DocumentStatus,
  DocumentCategory,
  DocumentFileName,
  DocumentUploader,
  EmbedDocumentStreamResult,
} from "./types/outputs";

// Public types - Errors
export type {
  DocumentProjectNotFoundError,
  DocumentUserNotFoundError,
  DocumentUnauthorizedProjectAccessError,
  DocumentProjectNoCompanyError,
  DocumentS3UploadUrlGenerationError,
  DocumentS3ListFailedError,
  DocumentError,
} from "./types/errors";
