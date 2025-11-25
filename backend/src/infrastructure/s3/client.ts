/**
 * AWS S3 Client
 *
 * Provides functionality for generating pre-signed URLs for S3 operations.
 * Used for secure, direct frontend-to-S3 document uploads.
 */

import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
  type _Object,
} from "@aws-sdk/client-s3";
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
 * Format: documents/{companyId}/{projectId}/{filename}
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

  return `documents/${String(companyId)}/${String(projectId)}/${sanitizedFilename}`;
}

/**
 * S3 object metadata returned from listing
 */
export type S3ObjectInfo = {
  key: string;
  fileName: string;
  size: number;
  lastModified: Date;
  contentType?: string;
};

/**
 * Parameters for listing objects in S3
 */
export type ListObjectsParams = {
  prefix: string;
  maxKeys?: number;
  continuationToken?: string;
};

/**
 * Result of listing objects in S3
 */
export type ListObjectsResult = {
  objects: S3ObjectInfo[];
  isTruncated: boolean;
  nextContinuationToken?: string;
};

/**
 * List objects in S3 bucket with a given prefix
 *
 * @param params - List objects parameters
 * @returns List of S3 objects with metadata
 */
export async function listObjects(
  params: ListObjectsParams,
): Promise<ListObjectsResult> {
  const { prefix, maxKeys = 1000, continuationToken } = params;

  try {
    logger.debug(
      {
        bucket: env.AWS_S3_BUCKET,
        prefix,
        maxKeys,
      },
      "Listing S3 objects",
    );

    const command = new ListObjectsV2Command({
      Bucket: env.AWS_S3_BUCKET,
      Prefix: prefix,
      MaxKeys: maxKeys,
      ContinuationToken: continuationToken,
    });

    const response = await s3Client.send(command);

    const objects: S3ObjectInfo[] = (response.Contents ?? []).map(
      (obj: _Object) => {
        const key = obj.Key ?? "";
        const parts = key.split("/");
        const fileName = parts[parts.length - 1] ?? "";

        return {
          key,
          fileName,
          size: obj.Size ?? 0,
          lastModified: obj.LastModified ?? new Date(),
        };
      },
    );

    logger.info(
      {
        bucket: env.AWS_S3_BUCKET,
        prefix,
        objectCount: objects.length,
        isTruncated: response.IsTruncated,
      },
      "Listed S3 objects",
    );

    return {
      objects,
      isTruncated: response.IsTruncated ?? false,
      nextContinuationToken: response.NextContinuationToken,
    };
  } catch (error) {
    logger.error(
      {
        error,
        bucket: env.AWS_S3_BUCKET,
        prefix,
      },
      "Failed to list S3 objects",
    );
    throw error;
  }
}

/**
 * Get metadata for a specific S3 object
 *
 * @param key - S3 object key
 * @returns Object metadata
 */
export async function getObjectMetadata(key: string): Promise<{
  contentType?: string;
  lastModified?: Date;
  size?: number;
  metadata?: Record<string, string>;
}> {
  try {
    const command = new HeadObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
    });

    const response = await s3Client.send(command);

    return {
      contentType: response.ContentType,
      lastModified: response.LastModified,
      size: response.ContentLength,
      metadata: response.Metadata,
    };
  } catch (error) {
    logger.error(
      {
        error,
        bucket: env.AWS_S3_BUCKET,
        key,
      },
      "Failed to get S3 object metadata",
    );
    throw error;
  }
}

/**
 * Build S3 prefix for listing documents in a project
 *
 * Format: documents/{companyId}/{projectId}/
 *
 * @param companyId - Company ID
 * @param projectId - Project ID
 * @returns S3 prefix for listing
 */
export function buildDocumentPrefix(
  companyId: number,
  projectId: number,
): string {
  return `documents/${String(companyId)}/${String(projectId)}/`;
}
