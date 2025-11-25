import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

/**
 * Generate Upload URL Request Body Schema
 */
export const generateUploadUrlBodySchema = z
  .object({
    fileName: z
      .string()
      .min(1, "File name is required")
      .max(255, "File name is too long")
      .openapi({ example: "project-proposal.pdf" }),
    fileSize: z
      .number()
      .int()
      .positive("File size must be positive")
      .openapi({ example: 1048576, description: "File size in bytes" }),
    fileType: z
      .string()
      .min(1, "File type is required")
      .regex(/^[a-z]+\/[a-z0-9\-+.]+$/i, "Invalid MIME type")
      .openapi({
        example: "application/pdf",
        description: "MIME type of the file",
      }),
    projectId: z
      .number()
      .int()
      .positive("Project ID must be positive")
      .openapi({ example: 1, description: "ID of the project" }),
  })
  .openapi("GenerateUploadUrlBody");

export type GenerateUploadUrlBody = z.infer<typeof generateUploadUrlBodySchema>;

/**
 * Generate Upload URL Response Schema
 */
export const generateUploadUrlResponseSchema = z
  .object({
    uploadUrl: z.url().openapi({
      example:
        "https://bucket.s3.amazonaws.com/path/to/file?X-Amz-Algorithm=...",
      description: "Pre-signed URL for uploading the file to S3",
    }),
    s3Key: z.string().openapi({
      example: "documents/1/5/project-proposal.pdf",
      description: "S3 object key where the file will be stored",
    }),
    expiresIn: z.number().int().positive().openapi({
      example: 900,
      description: "Number of seconds until the URL expires",
    }),
  })
  .openapi("GenerateUploadUrlResponse");

/**
 * Validation schema for generateUploadUrl route
 */
export const generateUploadUrlSchema = {
  body: generateUploadUrlBodySchema,
};

/**
 * Embed Document Request Body Schema
 */
export const embedDocumentBodySchema = z
  .object({
    s3Key: z
      .string()
      .min(1, "S3 key is required")
      .max(1024, "S3 key is too long")
      .openapi({
        example: "documents/1/5/project-proposal.pdf",
        description: "S3 object key of the document to embed",
      }),
    projectId: z
      .number()
      .int()
      .positive("Project ID must be positive")
      .openapi({ example: 1, description: "ID of the project" }),
    collectionName: z
      .string()
      .max(100, "Collection name is too long")
      .optional()
      .openapi({
        example: "EfsoraDocs",
        description:
          "Weaviate collection name (optional, uses default if not provided)",
      }),
  })
  .openapi("EmbedDocumentBody");

export type EmbedDocumentBody = z.infer<typeof embedDocumentBodySchema>;

/**
 * Validation schema for embedDocument route
 */
export const embedDocumentSchema: { body: typeof embedDocumentBodySchema } = {
  body: embedDocumentBodySchema,
};
