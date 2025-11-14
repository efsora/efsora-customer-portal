import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

/**
 * Create Project Request Body Schema
 */
export const createProjectBodySchema = z
  .object({
    name: z.string().min(3).max(200).openapi({ example: "Website Redesign" }),
    companyId: z.number().int().positive().openapi({ example: 1 }),
    status: z
      .number()
      .int()
      .positive()
      .optional()
      .nullable()
      .openapi({ example: 1 }),
  })
  .openapi("CreateProjectBody");

export type CreateProjectBody = z.infer<typeof createProjectBodySchema>;

/**
 * Update Project Request Body Schema
 */
export const updateProjectBodySchema = z
  .object({
    name: z
      .string()
      .min(3)
      .max(200)
      .optional()
      .openapi({ example: "Updated Project Name" }),
    status: z
      .number()
      .int()
      .positive()
      .optional()
      .nullable()
      .openapi({ example: 2 }),
  })
  .openapi("UpdateProjectBody");

export type UpdateProjectBody = z.infer<typeof updateProjectBodySchema>;

/**
 * Project ID Parameter Schema
 */
export const projectIdParamSchema = z
  .object({
    id: z.coerce.number().int().positive().openapi({ example: 1 }),
  })
  .openapi("ProjectIdParam");

export type ProjectIdParam = z.infer<typeof projectIdParamSchema>;

/**
 * Get Projects Query Schema (for filtering by company)
 */
export const getProjectsQuerySchema = z
  .object({
    companyId: z.coerce.number().int().positive().optional().openapi({
      example: 1,
      description: "Filter projects by company ID",
    }),
  })
  .openapi("GetProjectsQuery");

export type GetProjectsQuery = z.infer<typeof getProjectsQuerySchema>;

/**
 * Validation schemas for routes
 */
export const createProjectSchema = {
  body: createProjectBodySchema,
};

export const getProjectByIdSchema = {
  params: projectIdParamSchema,
};

export const getAllProjectsSchema = {
  query: getProjectsQuerySchema,
};

export const updateProjectSchema = {
  params: projectIdParamSchema,
  body: updateProjectBodySchema,
};

export const deleteProjectSchema = {
  params: projectIdParamSchema,
};

/**
 * Get Your Team Query Schema
 */
export const getYourTeamQuerySchema = z
  .object({
    projectId: z.coerce.number().int().positive().openapi({
      example: 1,
      description: "Project ID to get team members for",
    }),
  })
  .openapi("GetYourTeamQuery");

export type GetYourTeamQuery = z.infer<typeof getYourTeamQuerySchema>;

/**
 * Validation schema for getYourTeam route
 */
export const getYourTeamSchema = {
  query: getYourTeamQuerySchema,
};

/**
 * Team Member Schema
 * Based on ExtendedUserData from users module
 */
export const teamMemberSchema = z
  .object({
    id: z.uuid().openapi({
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
    email: z.email().openapi({ example: "john.doe@example.com" }),
    name: z.string().nullable().openapi({ example: "John" }),
    surname: z.string().nullable().openapi({ example: "Doe" }),
    bio: z.string().nullable().openapi({ example: "Senior developer" }),
    companyId: z.number().int().positive().nullable().openapi({ example: 1 }),
    roleId: z.number().int().positive().nullable().openapi({ example: 1 }),
    projectId: z.number().int().positive().nullable().openapi({ example: 1 }),
    createdAt: z.date().openapi({ example: "2025-01-15T10:00:00Z" }),
    updatedAt: z.date().openapi({ example: "2025-01-15T10:00:00Z" }),
  })
  .openapi("TeamMember");

/**
 * Get Your Team Response Schema
 */
export const getYourTeamResponseSchema = z
  .object({
    customerTeam: z.array(teamMemberSchema).openapi({
      example: [
        {
          id: "123e4567-e89b-12d3-a456-426614174000",
          email: "john.doe@company.com",
          name: "John",
          surname: "Doe",
          bio: "Senior developer",
          companyId: 2,
          roleId: 1,
          projectId: 1,
          createdAt: "2025-01-15T10:00:00Z",
          updatedAt: "2025-01-15T10:00:00Z",
        },
      ],
    }),
    efsoraTeam: z.array(teamMemberSchema).openapi({
      example: [
        {
          id: "223e4567-e89b-12d3-a456-426614174001",
          email: "jane.smith@efsora.com",
          name: "Jane",
          surname: "Smith",
          bio: "Project manager",
          companyId: 1,
          roleId: 2,
          projectId: 1,
          createdAt: "2025-01-15T10:00:00Z",
          updatedAt: "2025-01-15T10:00:00Z",
        },
      ],
    }),
  })
  .openapi("GetYourTeamResponse");

/**
 * Project Response Schema
 */
export const projectResponseSchema = z
  .object({
    id: z.number().int().positive().openapi({ example: 1 }),
    name: z.string().openapi({ example: "Website Redesign" }),
    companyId: z.number().int().positive().nullable().openapi({ example: 1 }),
    status: z.number().int().positive().nullable().openapi({ example: 1 }),
    createdAt: z.date().openapi({ example: "2025-01-15T10:00:00Z" }),
    updatedAt: z.date().openapi({ example: "2025-01-15T10:00:00Z" }),
  })
  .openapi("ProjectResponse");
