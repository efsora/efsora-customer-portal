import {
  createCompanyBodySchema,
  updateCompanyBodySchema,
  companyIdParamSchema,
  companyResponseSchema,
} from "#routes/companies/schemas";
import { registry } from "../registry.js";
import { commonErrorResponses, successResponseSchema } from "../schemas.js";

/**
 * POST /api/v1/companies
 * Create a new company
 */
registry.registerPath({
  method: "post",
  path: "/api/v1/companies",
  summary: "Create company",
  description: "Create a new company with the provided data",
  tags: ["Companies"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createCompanyBodySchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Company created successfully",
      content: {
        "application/json": {
          schema: successResponseSchema(companyResponseSchema),
        },
      },
    },
    400: commonErrorResponses[400],
    401: commonErrorResponses[401],
    409: commonErrorResponses[409],
    500: commonErrorResponses[500],
  },
});

/**
 * GET /api/v1/companies/:id
 * Get company by ID
 */
registry.registerPath({
  method: "get",
  path: "/api/v1/companies/{id}",
  summary: "Get company by ID",
  description: "Retrieve company information by ID",
  tags: ["Companies"],
  security: [{ BearerAuth: [] }],
  request: {
    params: companyIdParamSchema,
  },
  responses: {
    200: {
      description: "Company retrieved successfully",
      content: {
        "application/json": {
          schema: successResponseSchema(companyResponseSchema),
        },
      },
    },
    401: commonErrorResponses[401],
    404: commonErrorResponses[404],
    500: commonErrorResponses[500],
  },
});

/**
 * GET /api/v1/companies
 * Get all companies
 */
registry.registerPath({
  method: "get",
  path: "/api/v1/companies",
  summary: "Get all companies",
  description: "Retrieve all companies",
  tags: ["Companies"],
  security: [{ BearerAuth: [] }],
  responses: {
    200: {
      description: "Companies retrieved successfully",
      content: {
        "application/json": {
          schema: successResponseSchema(companyResponseSchema.array()),
        },
      },
    },
    401: commonErrorResponses[401],
    500: commonErrorResponses[500],
  },
});

/**
 * PUT /api/v1/companies/:id
 * Update company
 */
registry.registerPath({
  method: "put",
  path: "/api/v1/companies/{id}",
  summary: "Update company",
  description: "Update company information",
  tags: ["Companies"],
  security: [{ BearerAuth: [] }],
  request: {
    params: companyIdParamSchema,
    body: {
      content: {
        "application/json": {
          schema: updateCompanyBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Company updated successfully",
      content: {
        "application/json": {
          schema: successResponseSchema(companyResponseSchema),
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
 * DELETE /api/v1/companies/:id
 * Delete company
 */
registry.registerPath({
  method: "delete",
  path: "/api/v1/companies/{id}",
  summary: "Delete company",
  description: "Delete a company by ID",
  tags: ["Companies"],
  security: [{ BearerAuth: [] }],
  request: {
    params: companyIdParamSchema,
  },
  responses: {
    200: {
      description: "Company deleted successfully",
      content: {
        "application/json": {
          schema: successResponseSchema(
            companyResponseSchema.pick({ id: true }),
          ),
        },
      },
    },
    401: commonErrorResponses[401],
    404: commonErrorResponses[404],
    500: commonErrorResponses[500],
  },
});
