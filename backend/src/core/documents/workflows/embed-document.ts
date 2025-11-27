/**
 * Embed Document Workflow
 * Orchestrates document embedding into vector database
 */

import { logger } from "#infrastructure/logger";
import { streamEmbedDocument } from "../operations/embed-document.js";
import type { EmbedDocumentInput } from "../types/inputs.js";
import type { EmbedDocumentStreamResult } from "../types/outputs.js";

/**
 * Embed Document Workflow
 * Streams embedding progress from AI service
 *
 * Note: This workflow uses async generator pattern (like chat-stream)
 * since it's a streaming operation that proxies SSE events
 */
export async function* embedDocument(
  input: EmbedDocumentInput,
): EmbedDocumentStreamResult {
  logger.info(
    {
      s3Key: input.s3Key,
      projectId: input.projectId,
      userId: input.userId,
      collectionName: input.collectionName,
    },
    "Starting document embedding",
  );

  yield* streamEmbedDocument(input);

  logger.info(
    { s3Key: input.s3Key, projectId: input.projectId },
    "Document embedding completed",
  );
}
