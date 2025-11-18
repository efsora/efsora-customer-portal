import { z } from "zod";

import {
  getUserParamsSchema,
  userDataSchema,
  extendedUserDataSchema,
  assignToCompanyBodySchema,
  assignToProjectBodySchema,
  assignRoleBodySchema,
  updateProfileBodySchema,
  updatePasswordBodySchema,
} from "#routes/users/schemas";

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

/**
 * POST /api/v1/users/assign-company
 * Assign user to company (authenticated users only)
 */
registry.registerPath({
  description: "Assign a user to a company. Requires authentication.",
  method: "post",
  path: "/api/v1/users/assign-company",
  request: {
    body: {
      content: {
        "application/json": {
          schema: assignToCompanyBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: successResponseSchema(extendedUserDataSchema),
        },
      },
      description: "User assigned to company successfully",
    },
    400: commonErrorResponses[400],
    401: commonErrorResponses[401],
    404: commonErrorResponses[404],
    500: commonErrorResponses[500],
  },
  security: [{ BearerAuth: [] }],
  summary: "Assign user to company",
  tags: ["Users"],
});

/**
 * POST /api/v1/users/assign-project
 * Assign user to project (authenticated users only)
 */
registry.registerPath({
  description: "Assign a user to a project. Requires authentication.",
  method: "post",
  path: "/api/v1/users/assign-project",
  request: {
    body: {
      content: {
        "application/json": {
          schema: assignToProjectBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: successResponseSchema(extendedUserDataSchema),
        },
      },
      description: "User assigned to project successfully",
    },
    400: commonErrorResponses[400],
    401: commonErrorResponses[401],
    404: commonErrorResponses[404],
    500: commonErrorResponses[500],
  },
  security: [{ BearerAuth: [] }],
  summary: "Assign user to project",
  tags: ["Users"],
});

/**
 * POST /api/v1/users/assign-role
 * Assign role to user (authenticated users only)
 */
registry.registerPath({
  description: "Assign a role to a user. Requires authentication.",
  method: "post",
  path: "/api/v1/users/assign-role",
  request: {
    body: {
      content: {
        "application/json": {
          schema: assignRoleBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: successResponseSchema(extendedUserDataSchema),
        },
      },
      description: "Role assigned to user successfully",
    },
    400: commonErrorResponses[400],
    401: commonErrorResponses[401],
    404: commonErrorResponses[404],
    500: commonErrorResponses[500],
  },
  security: [{ BearerAuth: [] }],
  summary: "Assign role to user",
  tags: ["Users"],
});

/**
 * PUT /api/v1/users/profile
 * Update user profile (authenticated users only)
 */
registry.registerPath({
  description: "Update user profile information. Requires authentication.",
  method: "put",
  path: "/api/v1/users/profile",
  request: {
    body: {
      content: {
        "application/json": {
          schema: updateProfileBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: successResponseSchema(extendedUserDataSchema),
        },
      },
      description: "Profile updated successfully",
    },
    400: commonErrorResponses[400],
    401: commonErrorResponses[401],
    404: commonErrorResponses[404],
    500: commonErrorResponses[500],
  },
  security: [{ BearerAuth: [] }],
  summary: "Update user profile",
  tags: ["Users"],
});

/**
 * PUT /api/v1/users/password
 * Update user password (authenticated users only)
 */
registry.registerPath({
  description:
    "Update user password. Requires current password for verification. Requires authentication.",
  method: "put",
  path: "/api/v1/users/password",
  request: {
    body: {
      content: {
        "application/json": {
          schema: updatePasswordBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: successResponseSchema(extendedUserDataSchema),
        },
      },
      description: "Password updated successfully",
    },
    400: commonErrorResponses[400],
    401: commonErrorResponses[401],
    404: commonErrorResponses[404],
    500: commonErrorResponses[500],
  },
  security: [{ BearerAuth: [] }],
  summary: "Update user password",
  tags: ["Users"],
});
