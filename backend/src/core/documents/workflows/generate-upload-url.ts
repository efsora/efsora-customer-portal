import { pipe, type Result } from "#lib/result";
import {
  validateProject,
  validateUserAccess,
  generateS3UploadUrl,
} from "../operations/generate-upload-url";
import type { GenerateUploadUrlInput } from "../types/inputs";
import type { GenerateUploadUrlResult } from "../types/outputs";

/**
 * Generate Upload URL Workflow
 * 1. Validate project exists
 * 2. Validate user has access to the project (same company)
 * 3. Generate S3 pre-signed upload URL
 */
export function generateUploadUrl(
  input: GenerateUploadUrlInput,
): Result<GenerateUploadUrlResult> {
  return pipe(validateProject(input), validateUserAccess, generateS3UploadUrl);
}
