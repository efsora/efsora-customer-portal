/**
 * AWS S3 Client
 *
 * Provides functionality for generating pre-signed URLs for S3 operations.
 * Used for secure, direct frontend-to-S3 document uploads.
 */

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "#infrastructure/config/env.js";
import { logger } from "#infrastructure/logger";

/**
 * Configuration for S3 client
 */
const s3Config = {
  region: env.AWS_S3_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
};

/**
 * S3 client instance
 */
const s3Client = new S3Client(s3Config);

/**
 * Parameters for generating a pre-signed upload URL
 */
export type GenerateUploadUrlParams = {
  key: string;
  contentType: string;
  expiresIn?: number; // seconds, default 900 (15 minutes)
};

/**
 * Result of generating a pre-signed upload URL
 */
export type GenerateUploadUrlResult = {
  url: string;
  key: string;
  expiresIn: number;
};

/**
 * Generate a pre-signed URL for uploading a file to S3
 *
 * @param params - Upload URL generation parameters
 * @returns Pre-signed URL and metadata
 */
export async function generatePresignedUploadUrl(
  params: GenerateUploadUrlParams,
): Promise<GenerateUploadUrlResult> {
  const { key, contentType, expiresIn = 900 } = params;

  try {
    logger.debug(
      {
        bucket: env.AWS_S3_BUCKET,
        key,
        contentType,
        expiresIn,
      },
      "Generating S3 pre-signed upload URL",
    );

    const command = new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });

    logger.info(
      {
        bucket: env.AWS_S3_BUCKET,
        key,
        expiresIn,
      },
      "Generated S3 pre-signed upload URL",
    );

    return {
      url,
      key,
      expiresIn,
    };
  } catch (error) {
    logger.error(
      {
        error,
        bucket: env.AWS_S3_BUCKET,
        key,
      },
      "Failed to generate S3 pre-signed upload URL",
    );
    throw error;
  }
}

/**
 * Build S3 key for document storage
 *
 * Format: efsora-customer-portal/documents/{companyId}/{projectId}/{filename}
 *
 * @param companyId - Company ID
 * @param projectId - Project ID
 * @param filename - Original filename
 * @returns S3 object key
 */
export function buildDocumentKey(
  companyId: number,
  projectId: number,
  filename: string,
): string {
  // Sanitize filename to prevent path traversal
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");

  return `efsora-customer-portal/documents/${String(companyId)}/${String(projectId)}/${sanitizedFilename}`;
}
