import {
  registerBodySchema,
  loginBodySchema,
  registerResponseSchema,
  loginResponseSchema,
} from "#routes/auth/schemas";

import { registry } from "../registry.js";
import { commonErrorResponses, successResponseSchema } from "../schemas.js";

/**
 * POST /api/v1/auth/register
 * Register a new user
 */
registry.registerPath({
  description: "Register a new user account with email, name, and password",
  method: "post",
  path: "/api/v1/auth/register",
  request: {
    body: {
      content: {
        "application/json": {
          schema: registerBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: successResponseSchema(registerResponseSchema),
        },
      },
      description: "User registered successfully with JWT token",
    },
    400: commonErrorResponses[400],
    409: commonErrorResponses[409],
    500: commonErrorResponses[500],
  },
  summary: "Register user",
  tags: ["Auth"],
});

/**
 * POST /api/v1/auth/login
 * Login an existing user
 */
registry.registerPath({
  description: "Login with email and password to receive JWT authentication token",
  method: "post",
  path: "/api/v1/auth/login",
  request: {
    body: {
      content: {
        "application/json": {
          schema: loginBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: successResponseSchema(loginResponseSchema),
        },
      },
      description: "Login successful with JWT token",
    },
    400: commonErrorResponses[400],
    401: commonErrorResponses[401],
    500: commonErrorResponses[500],
  },
  summary: "Login user",
  tags: ["Auth"],
});
