import {
  createSuccessResponse,
  createFailureResponse,
  type AppResponse,
} from "#lib/types/response";
import { run, matchResponse } from "#lib/result";
import type { ValidatedRequest } from "#middlewares/validate";
import type { AuthenticatedRequest } from "#middlewares/auth";
import type { GenerateUploadUrlBody } from "./schemas";
import {
  generateUploadUrl,
  type GenerateUploadUrlResult,
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
