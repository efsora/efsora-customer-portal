/**
 * Document Error Types
 * Define error structures for document operations
 */

import type { ErrorBase } from "#lib/result/types/errors";

/**
 * Error when project is not found during document operation
 */
export type DocumentProjectNotFoundError = ErrorBase & {
  code: "DOCUMENT_PROJECT_NOT_FOUND";
};

/**
 * Error when user is not found during document operation
 */
export type DocumentUserNotFoundError = ErrorBase & {
  code: "DOCUMENT_USER_NOT_FOUND";
};

/**
 * Error when user attempts to upload document to project they don't have access to
 */
export type DocumentUnauthorizedProjectAccessError = ErrorBase & {
  code: "DOCUMENT_UNAUTHORIZED_PROJECT_ACCESS";
};

/**
 * Error when project has no associated company
 */
export type DocumentProjectNoCompanyError = ErrorBase & {
  code: "DOCUMENT_PROJECT_NO_COMPANY";
};

/**
 * Error when S3 upload URL generation fails
 */
export type DocumentS3UploadUrlGenerationError = ErrorBase & {
  code: "DOCUMENT_S3_URL_GENERATION_FAILED";
};

/**
 * Union type for all document-specific errors
 */
export type DocumentError =
  | DocumentProjectNotFoundError
  | DocumentUserNotFoundError
  | DocumentUnauthorizedProjectAccessError
  | DocumentProjectNoCompanyError
  | DocumentS3UploadUrlGenerationError;
