import { z } from "zod";
import {
  createEventBodySchema,
  updateEventBodySchema,
  eventIdParamSchema,
  eventResponseSchema,
} from "#routes/events/schemas";
import { registry } from "../registry.js";
import { commonErrorResponses, successResponseSchema } from "../schemas.js";

/**
 * POST /api/v1/events
 * Create a new event
 */
registry.registerPath({
  method: "post",
  path: "/api/v1/events",
  summary: "Create event",
  description: "Create a new event",
  tags: ["Events"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createEventBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Event created successfully",
      content: {
        "application/json": {
          schema: successResponseSchema(eventResponseSchema),
        },
      },
    },
    400: commonErrorResponses[400],
    401: commonErrorResponses[401],
    500: commonErrorResponses[500],
  },
});

/**
 * GET /api/v1/events/:id
 * Get event by ID
 */
registry.registerPath({
  method: "get",
  path: "/api/v1/events/{id}",
  summary: "Get event by ID",
  description: "Retrieve a specific event by ID",
  tags: ["Events"],
  security: [{ BearerAuth: [] }],
  request: {
    params: eventIdParamSchema,
  },
  responses: {
    200: {
      description: "Event retrieved successfully",
      content: {
        "application/json": {
          schema: successResponseSchema(eventResponseSchema),
        },
      },
    },
    401: commonErrorResponses[401],
    404: commonErrorResponses[404],
    500: commonErrorResponses[500],
  },
});

/**
 * GET /api/v1/events
 * Get all events
 */
registry.registerPath({
  method: "get",
  path: "/api/v1/events",
  summary: "Get all events",
  description: "Retrieve all events",
  tags: ["Events"],
  security: [{ BearerAuth: [] }],
  responses: {
    200: {
      description: "Events retrieved successfully",
      content: {
        "application/json": {
          schema: successResponseSchema(z.array(eventResponseSchema)),
        },
      },
    },
    401: commonErrorResponses[401],
    500: commonErrorResponses[500],
  },
});

/**
 * PUT /api/v1/events/:id
 * Update event
 */
registry.registerPath({
  method: "put",
  path: "/api/v1/events/{id}",
  summary: "Update event",
  description: "Update an existing event",
  tags: ["Events"],
  security: [{ BearerAuth: [] }],
  request: {
    params: eventIdParamSchema,
    body: {
      content: {
        "application/json": {
          schema: updateEventBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Event updated successfully",
      content: {
        "application/json": {
          schema: successResponseSchema(eventResponseSchema),
        },
      },
    },
    400: commonErrorResponses[400],
    401: commonErrorResponses[401],
    404: commonErrorResponses[404],
    500: commonErrorResponses[500],
  },
});

/**
 * DELETE /api/v1/events/:id
 * Delete event
 */
registry.registerPath({
  method: "delete",
  path: "/api/v1/events/{id}",
  summary: "Delete event",
  description: "Delete an event",
  tags: ["Events"],
  security: [{ BearerAuth: [] }],
  request: {
    params: eventIdParamSchema,
  },
  responses: {
    200: {
      description: "Event deleted successfully",
      content: {
        "application/json": {
          schema: successResponseSchema(
            z.object({
              id: z.number(),
              message: z.string(),
            }),
          ),
        },
      },
    },
    401: commonErrorResponses[401],
    404: commonErrorResponses[404],
    500: commonErrorResponses[500],
  },
});
