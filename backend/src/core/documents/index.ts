/**
 * Documents Module
 * Public API for document operations
 */

// Workflows
export { generateUploadUrl } from "./workflows/generate-upload-url";

// Public types - Inputs
export type { GenerateUploadUrlInput } from "./types/inputs";

// Public types - Outputs
export type { GenerateUploadUrlResult } from "./types/outputs";

// Public types - Errors
export type {
  DocumentProjectNotFoundError,
  DocumentUserNotFoundError,
  DocumentUnauthorizedProjectAccessError,
  DocumentProjectNoCompanyError,
  DocumentS3UploadUrlGenerationError,
  DocumentError,
} from "./types/errors";
