/**
 * Document Embedding Operations
 * Operations for embedding documents into vector database
 */

import { aiServiceClient } from "#infrastructure/ai-service";
import type { EmbedDocumentInput } from "../types/inputs.js";
import type { EmbedDocumentStreamResult } from "../types/outputs.js";

/**
 * Stream document embedding from AI service
 * Bridges to AIServiceClient - logging is handled at workflow and infrastructure layers
 */
export async function* streamEmbedDocument(
  input: EmbedDocumentInput,
): EmbedDocumentStreamResult {
  const stream = aiServiceClient.streamEmbedDocument(
    input.s3Key,
    String(input.projectId),
    input.collectionName,
  );

  for await (const chunk of stream) {
    yield chunk;
  }
}
