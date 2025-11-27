import type { Response } from "express";
import {
  createSuccessResponse,
  createFailureResponse,
  type AppResponse,
} from "#lib/types/response";
import { run, matchResponse } from "#lib/result";
import type { ValidatedRequest } from "#middlewares/validate";
import type { AuthenticatedRequest } from "#middlewares/auth";
import type {
  GenerateUploadUrlBody,
  ListDocumentsQuery,
  EmbedDocumentBody,
} from "./schemas";
import {
  generateUploadUrl,
  listDocuments,
  type GenerateUploadUrlResult,
  type ListDocumentsResult,
  embedDocument,
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
        s3Key: data.s3Key,
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

/**
 * Result type for embed document streaming operation
 * This is an async generator that yields string chunks (SSE data)
 */
export type EmbedDocumentStreamResult = AsyncGenerator<string, void, unknown>;

/**
 * Handler for POST /api/v1/documents/embed
 * Proxy SSE stream from AI service for document embedding
 *
 * This handler does NOT return AppResponse - it streams directly to the response
 */
export async function handleEmbedDocument(
  req: AuthenticatedRequest & ValidatedRequest<{ body: EmbedDocumentBody }>,
  res: Response,
): Promise<void> {
  const body = req.validated.body;
  const userId = req.userId ?? "";

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  try {
    const stream = embedDocument({
      s3Key: body.s3Key,
      projectId: body.projectId,
      userId,
      collectionName: body.collectionName,
    });

    for await (const chunk of stream) {
      res.write(chunk);
    }

    res.end();
  } catch (error) {
    // HTTP-level error handling - send error response to client
    res.write(
      `data: ${JSON.stringify({
        stage: "error",
        progress_percent: 0,
        message: error instanceof Error ? error.message : "Unknown error",
        error_code: "PROXY_ERROR",
      })}\n\n`,
    );
    res.end();
  }
}
