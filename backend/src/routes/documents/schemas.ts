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
    category: z.enum(["SoW", "Legal", "Billing", "Assets"]).openapi({
      example: "SoW",
      description: "Document category",
    }),
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
 * List Documents Query Parameters Schema
 */
export const listDocumentsQuerySchema = z
  .object({
    companyId: z.coerce
      .number()
      .int()
      .positive("Company ID must be positive")
      .openapi({ example: 1, description: "ID of the company" }),
    projectId: z.coerce
      .number()
      .int()
      .positive("Project ID must be positive")
      .openapi({ example: 1, description: "ID of the project" }),
  })
  .openapi("ListDocumentsQuery");

export type ListDocumentsQuery = z.infer<typeof listDocumentsQuerySchema>;

/**
 * Document File Name Schema
 */
export const documentFileNameSchema = z
  .object({
    name: z.string().openapi({ example: "Customer_Report_Q1.pdf" }),
    icon: z.string().openapi({ example: "/documents/table-doc.svg" }),
  })
  .openapi("DocumentFileName");

/**
 * Document Uploader Schema
 */
export const documentUploaderSchema = z
  .object({
    name: z.string().openapi({ example: "Jane Doe" }),
    icon: z.string().openapi({ example: "/documents/table-person.svg" }),
  })
  .openapi("DocumentUploader");

/**
 * Document Status Schema
 */
export const documentStatusSchema = z
  .enum(["signed", "inProgress", "paid", "sent"])
  .openapi("DocumentStatus");

/**
 * Document Category Schema
 */
export const documentCategorySchema = z
  .enum(["SoW", "Legal", "Billing", "Assets"])
  .openapi("DocumentCategory");

/**
 * Document Row Schema (matches frontend FileRow without version)
 */
export const documentRowSchema = z
  .object({
    id: z.string().openapi({ example: "1" }),
    fileName: documentFileNameSchema,
    uploader: documentUploaderSchema,
    lastUpdated: z.string().openapi({ example: "2025-11-10T09:12:00Z" }),
    dateCreated: z.string().openapi({ example: "2025-10-01T08:00:00Z" }),
    status: documentStatusSchema,
    category: documentCategorySchema,
  })
  .openapi("DocumentRow");

/**
 * List Documents Response Schema
 */
export const listDocumentsResponseSchema = z
  .object({
    documents: z.array(documentRowSchema).openapi({
      description: "List of documents",
    }),
  })
  .openapi("ListDocumentsResponse");

/**
 * Validation schema for listDocuments route
 */
export const listDocumentsSchema = {
  query: listDocumentsQuerySchema,
};
