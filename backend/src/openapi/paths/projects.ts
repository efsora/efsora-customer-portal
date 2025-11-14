import {
  createProjectBodySchema,
  updateProjectBodySchema,
  projectIdParamSchema,
  projectResponseSchema,
  getProjectsQuerySchema,
  getYourTeamQuerySchema,
  getYourTeamResponseSchema,
} from "#routes/projects/schemas";
import { registry } from "../registry.js";
import { commonErrorResponses, successResponseSchema } from "../schemas.js";

/**
 * POST /api/v1/projects
 * Create a new project
 */
registry.registerPath({
  method: "post",
  path: "/api/v1/projects",
  summary: "Create project",
  description: "Create a new project within a company",
  tags: ["Projects"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createProjectBodySchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Project created successfully",
      content: {
        "application/json": {
          schema: successResponseSchema(projectResponseSchema),
        },
      },
    },
    400: commonErrorResponses[400],
    401: commonErrorResponses[401],
    404: commonErrorResponses[404],
    409: commonErrorResponses[409],
    500: commonErrorResponses[500],
  },
});

/**
 * GET /api/v1/projects/:id
 * Get project by ID
 */
registry.registerPath({
  method: "get",
  path: "/api/v1/projects/{id}",
  summary: "Get project by ID",
  description: "Retrieve project information by ID",
  tags: ["Projects"],
  security: [{ BearerAuth: [] }],
  request: {
    params: projectIdParamSchema,
  },
  responses: {
    200: {
      description: "Project retrieved successfully",
      content: {
        "application/json": {
          schema: successResponseSchema(projectResponseSchema),
        },
      },
    },
    401: commonErrorResponses[401],
    404: commonErrorResponses[404],
    500: commonErrorResponses[500],
  },
});

/**
 * GET /api/v1/projects
 * Get all projects (optionally filter by company)
 */
registry.registerPath({
  method: "get",
  path: "/api/v1/projects",
  summary: "Get all projects",
  description: "Retrieve all projects, optionally filtered by company ID",
  tags: ["Projects"],
  security: [{ BearerAuth: [] }],
  request: {
    query: getProjectsQuerySchema,
  },
  responses: {
    200: {
      description: "Projects retrieved successfully",
      content: {
        "application/json": {
          schema: successResponseSchema(projectResponseSchema.array()),
        },
      },
    },
    401: commonErrorResponses[401],
    500: commonErrorResponses[500],
  },
});

/**
 * GET /api/v1/projects/team
 * Get team members for a project (customer and efsora teams)
 */
registry.registerPath({
  method: "get",
  path: "/api/v1/projects/team",
  summary: "Get project team members",
  description:
    "Retrieve team members for a project, split into customer team and efsora team. Automatically uses the authenticated user's company ID.",
  tags: ["Projects"],
  security: [{ BearerAuth: [] }],
  request: {
    query: getYourTeamQuerySchema,
  },
  responses: {
    200: {
      description: "Team members retrieved successfully",
      content: {
        "application/json": {
          schema: successResponseSchema(getYourTeamResponseSchema),
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
 * PATCH /api/v1/projects/:id
 * Update project
 */
registry.registerPath({
  method: "patch",
  path: "/api/v1/projects/{id}",
  summary: "Update project",
  description: "Update project information (partial update)",
  tags: ["Projects"],
  security: [{ BearerAuth: [] }],
  request: {
    params: projectIdParamSchema,
    body: {
      content: {
        "application/json": {
          schema: updateProjectBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Project updated successfully",
      content: {
        "application/json": {
          schema: successResponseSchema(projectResponseSchema),
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
 * DELETE /api/v1/projects/:id
 * Delete project
 */
registry.registerPath({
  method: "delete",
  path: "/api/v1/projects/{id}",
  summary: "Delete project",
  description: "Delete a project by ID",
  tags: ["Projects"],
  security: [{ BearerAuth: [] }],
  request: {
    params: projectIdParamSchema,
  },
  responses: {
    200: {
      description: "Project deleted successfully",
      content: {
        "application/json": {
          schema: successResponseSchema(
            projectResponseSchema.pick({ id: true }),
          ),
        },
      },
    },
    401: commonErrorResponses[401],
    404: commonErrorResponses[404],
    500: commonErrorResponses[500],
  },
});
