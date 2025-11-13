import {
  createMilestoneBodySchema,
  updateMilestoneBodySchema,
  milestoneIdParamSchema,
  milestoneResponseSchema,
} from "#routes/milestones/schemas";
import { registry } from "../registry.js";
import { commonErrorResponses, successResponseSchema } from "../schemas.js";

/**
 * POST /api/v1/milestones
 * Create a new milestone
 */
registry.registerPath({
  method: "post",
  path: "/api/v1/milestones",
  summary: "Create milestone",
  description: "Create a new milestone with the provided data",
  tags: ["Milestones"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createMilestoneBodySchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Milestone created successfully",
      content: {
        "application/json": {
          schema: successResponseSchema(milestoneResponseSchema),
        },
      },
    },
    400: commonErrorResponses[400],
    401: commonErrorResponses[401],
    500: commonErrorResponses[500],
  },
});

/**
 * GET /api/v1/milestones/:id
 * Get milestone by ID
 */
registry.registerPath({
  method: "get",
  path: "/api/v1/milestones/{id}",
  summary: "Get milestone by ID",
  description: "Retrieve milestone information by ID",
  tags: ["Milestones"],
  security: [{ BearerAuth: [] }],
  request: {
    params: milestoneIdParamSchema,
  },
  responses: {
    200: {
      description: "Milestone retrieved successfully",
      content: {
        "application/json": {
          schema: successResponseSchema(milestoneResponseSchema),
        },
      },
    },
    401: commonErrorResponses[401],
    404: commonErrorResponses[404],
    500: commonErrorResponses[500],
  },
});

/**
 * GET /api/v1/milestones
 * Get all milestones
 */
registry.registerPath({
  method: "get",
  path: "/api/v1/milestones",
  summary: "Get all milestones",
  description: "Retrieve all milestones",
  tags: ["Milestones"],
  security: [{ BearerAuth: [] }],
  responses: {
    200: {
      description: "Milestones retrieved successfully",
      content: {
        "application/json": {
          schema: successResponseSchema(milestoneResponseSchema.array()),
        },
      },
    },
    401: commonErrorResponses[401],
    500: commonErrorResponses[500],
  },
});

/**
 * PUT /api/v1/milestones/:id
 * Update milestone
 */
registry.registerPath({
  method: "put",
  path: "/api/v1/milestones/{id}",
  summary: "Update milestone",
  description: "Update milestone information",
  tags: ["Milestones"],
  security: [{ BearerAuth: [] }],
  request: {
    params: milestoneIdParamSchema,
    body: {
      content: {
        "application/json": {
          schema: updateMilestoneBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Milestone updated successfully",
      content: {
        "application/json": {
          schema: successResponseSchema(milestoneResponseSchema),
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
 * DELETE /api/v1/milestones/:id
 * Delete milestone
 */
registry.registerPath({
  method: "delete",
  path: "/api/v1/milestones/{id}",
  summary: "Delete milestone",
  description: "Delete a milestone by ID",
  tags: ["Milestones"],
  security: [{ BearerAuth: [] }],
  request: {
    params: milestoneIdParamSchema,
  },
  responses: {
    200: {
      description: "Milestone deleted successfully",
      content: {
        "application/json": {
          schema: successResponseSchema(
            milestoneResponseSchema.pick({ id: true }),
          ),
        },
      },
    },
    401: commonErrorResponses[401],
    404: commonErrorResponses[404],
    500: commonErrorResponses[500],
  },
});
