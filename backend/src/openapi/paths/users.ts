import { z } from "zod";

import { getUserParamsSchema, userDataSchema } from "#routes/users/schemas";

import { registry } from "../registry.js";
import { commonErrorResponses, successResponseSchema } from "../schemas.js";

/**
 * GET /api/v1/users
 * Get all users (authenticated users only)
 */
registry.registerPath({
  description: "Retrieve all users. Requires authentication.",
  method: "get",
  path: "/api/v1/users",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: successResponseSchema(z.array(userDataSchema)),
        },
      },
      description: "List of users",
    },
    401: commonErrorResponses[401],
    500: commonErrorResponses[500],
  },
  security: [{ BearerAuth: [] }],
  summary: "Get all users",
  tags: ["Users"],
});

/**
 * GET /api/v1/users/{id}
 * Get user by ID (authenticated users only, can only access own data)
 */
registry.registerPath({
  description:
    "Retrieve user information by ID. Users can only access their own data.",
  method: "get",
  path: "/api/v1/users/{id}",
  request: {
    params: getUserParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: successResponseSchema(userDataSchema),
        },
      },
      description: "User found",
    },
    401: commonErrorResponses[401],
    403: commonErrorResponses[403],
    404: commonErrorResponses[404],
    500: commonErrorResponses[500],
  },
  security: [{ BearerAuth: [] }],
  summary: "Get user by ID",
  tags: ["Users"],
});
