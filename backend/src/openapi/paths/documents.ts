import {
  generateUploadUrlBodySchema,
  generateUploadUrlResponseSchema,
} from "#routes/documents/schemas";
import { registry } from "../registry.js";
import { commonErrorResponses, successResponseSchema } from "../schemas.js";

/**
 * POST /api/v1/documents/get-upload-url
 * Generate pre-signed URL for document upload
 */
registry.registerPath({
  method: "post",
  path: "/api/v1/documents/get-upload-url",
  summary: "Generate pre-signed upload URL",
  description:
    "Generate a pre-signed S3 URL for uploading a document. The URL expires in 15 minutes. User must have access to the project (same company).",
  tags: ["Documents"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: generateUploadUrlBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Pre-signed upload URL generated successfully",
      content: {
        "application/json": {
          schema: successResponseSchema(generateUploadUrlResponseSchema),
        },
      },
    },
    400: commonErrorResponses[400],
    401: commonErrorResponses[401],
    403: commonErrorResponses[403],
    404: commonErrorResponses[404],
    500: commonErrorResponses[500],
  },
});
