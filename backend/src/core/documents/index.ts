/**
 * Documents Module
 * Public API for document operations
 */

// Workflows
export { generateUploadUrl } from "./workflows/generate-upload-url";
export { embedDocument } from "./workflows/embed-document";

// Public types - Inputs
export type {
  GenerateUploadUrlInput,
  EmbedDocumentInput,
} from "./types/inputs";

// Public types - Outputs
export type {
  GenerateUploadUrlResult,
  EmbedDocumentStreamResult,
} from "./types/outputs";

// Public types - Errors
export type {
  DocumentProjectNotFoundError,
  DocumentUserNotFoundError,
  DocumentUnauthorizedProjectAccessError,
  DocumentProjectNoCompanyError,
  DocumentS3UploadUrlGenerationError,
  DocumentError,
} from "./types/errors";
