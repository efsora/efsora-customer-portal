import { type Result } from "#lib/result";
import { listDocumentsFromS3 } from "../operations/list-documents";
import type { ListDocumentsInput } from "../types/inputs";
import type { ListDocumentsResult } from "../types/outputs";

/**
 * List Documents Workflow
 * Lists documents from S3 for a given company and project
 */
export function listDocuments(
  input: ListDocumentsInput,
): Result<ListDocumentsResult> {
  return listDocumentsFromS3(input);
}
