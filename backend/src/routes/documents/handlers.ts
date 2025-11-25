import type { Response } from "express";
import {
  createSuccessResponse,
  createFailureResponse,
  type AppResponse,
} from "#lib/types/response";
import { run, matchResponse } from "#lib/result";
import type { ValidatedRequest } from "#middlewares/validate";
import type { AuthenticatedRequest } from "#middlewares/auth";
import type { GenerateUploadUrlBody, EmbedDocumentBody } from "./schemas";
import {
  generateUploadUrl,
  type GenerateUploadUrlResult,
} from "#core/documents";
import { env } from "#infrastructure/config/env.js";
import { logger } from "#infrastructure/logger";

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
        s3Key: data.s3Key,
        expiresIn: data.expiresIn,
      }),
    onFailure: (error) => createFailureResponse(error),
  });
}

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

  logger.info(
    {
      s3Key: body.s3Key,
      projectId: body.projectId,
      userId: req.userId,
    },
    "Starting document embedding proxy",
  );

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  try {
    // Call AI service embed-document endpoint
    const aiServiceUrl = `${env.AI_SERVICE_URL}/api/v1/weaviate/embed-document`;

    const response = await fetch(aiServiceUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        s3_key: body.s3Key,
        project_id: body.projectId,
        collection_name: body.collectionName ?? null,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(
        {
          status: response.status,
          error: errorText,
          s3Key: body.s3Key,
        },
        "AI service embed-document request failed",
      );

      // Send error event
      res.write(
        `data: ${JSON.stringify({
          stage: "error",
          progress_percent: 0,
          message: `AI service error: ${String(response.status)}`,
          error_code: "AI_SERVICE_ERROR",
        })}\n\n`,
      );
      res.end();
      return;
    }

    // Proxy the SSE stream from AI service to frontend
    const reader = response.body?.getReader();
    if (!reader) {
      res.write(
        `data: ${JSON.stringify({
          stage: "error",
          progress_percent: 0,
          message: "No response body from AI service",
          error_code: "AI_SERVICE_NO_BODY",
        })}\n\n`,
      );
      res.end();
      return;
    }

    const decoder = new TextDecoder();

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    while (true) {
      const result = await reader.read();

      if (result.done) {
        break;
      }

      // Forward the chunk to the client
      const chunk = decoder.decode(result.value as Uint8Array, {
        stream: true,
      });
      res.write(chunk);
    }

    res.end();
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        s3Key: body.s3Key,
      },
      "Error proxying embed-document request",
    );

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
