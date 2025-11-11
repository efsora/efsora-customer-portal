import {
  registerBodySchema,
  loginBodySchema,
  registerResponseSchema,
  loginResponseSchema,
  logoutResponseSchema,
} from "#routes/auth/schemas";

import { registry } from "../registry.js";
import { commonErrorResponses, successResponseSchema } from "../schemas.js";

/**
 * POST /api/v1/auth/register
 * Register a new user with session-based authentication
 */
registry.registerPath({
  description:
    "Register a new user account with email, name, and password. Creates a session in the database for immediate authentication. The returned JWT token is tied to an active session that can be invalidated on logout.",
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
      description:
        "User registered successfully with JWT token and active session created",
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
 * Login an existing user with session-based authentication
 */
registry.registerPath({
  description:
    "Login with email and password to receive JWT authentication token. Creates a new session in the database that ties the token to an active session. Each login creates a unique session that can be independently invalidated.",
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
      description: "Login successful with JWT token and new session created",
    },
    400: commonErrorResponses[400],
    401: commonErrorResponses[401],
    500: commonErrorResponses[500],
  },
  summary: "Login user",
  tags: ["Auth"],
});

/**
 * POST /api/v1/auth/logout
 * Logout the current user with immediate session invalidation
 */
registry.registerPath({
  description:
    "Logout the authenticated user by deleting their session from the database. This immediately invalidates the JWT token - any subsequent requests using this token will fail authentication. Provides production-ready security without requiring Redis or token blacklist. The client should also clear the token from local storage.",
  method: "post",
  path: "/api/v1/auth/logout",
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {},
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: successResponseSchema(logoutResponseSchema),
        },
      },
      description:
        "Logout successful, session deleted from database, token immediately invalidated",
    },
    401: commonErrorResponses[401],
    500: commonErrorResponses[500],
  },
  summary: "Logout user",
  tags: ["Auth"],
});
