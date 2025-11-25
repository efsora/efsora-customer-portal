import {
  createSuccessResponse,
  createFailureResponse,
  type AppResponse,
} from "#lib/types/response";
import { run, matchResponse } from "#lib/result";
import type { ValidatedRequest } from "#middlewares/validate";
import type { AuthenticatedRequest } from "#middlewares/auth";
import type { GenerateUploadUrlBody, ListDocumentsQuery } from "./schemas";
import {
  generateUploadUrl,
  listDocuments,
  type GenerateUploadUrlResult,
  type ListDocumentsResult,
} from "#core/documents";

/**
 * Handler for POST /api/v1/documents/get-upload-url
 * Generate a pre-signed URL for uploading a document to S3
 */
export async function handleGenerateUploadUrl(
  req: ValidatedRequest<{ body: GenerateUploadUrlBody }> & AuthenticatedRequest,
): Promise<AppResponse<GenerateUploadUrlResult>> {
  const body = req.validated.body;
  const userId = req.userId ?? ""; // Guaranteed by auth middleware

  const result = await run(
    generateUploadUrl({
      fileName: body.fileName,
      fileSize: body.fileSize,
      fileType: body.fileType,
      projectId: body.projectId,
      userId,
      category: body.category,
    }),
  );

  return matchResponse(result, {
    onSuccess: (data) =>
      createSuccessResponse({
        uploadUrl: data.uploadUrl,
        expiresIn: data.expiresIn,
      }),
    onFailure: (error) => createFailureResponse(error),
  });
}

/**
 * Handler for GET /api/v1/documents
 * List documents from S3 for a given company and project
 */
export async function handleListDocuments(
  req: ValidatedRequest<{ query: ListDocumentsQuery }>,
): Promise<AppResponse<ListDocumentsResult>> {
  const query = req.validated.query;

  const result = await run(
    listDocuments({
      companyId: query.companyId,
      projectId: query.projectId,
    }),
  );

  return matchResponse(result, {
    onSuccess: (data) => createSuccessResponse(data),
    onFailure: (error) => createFailureResponse(error),
  });
}
