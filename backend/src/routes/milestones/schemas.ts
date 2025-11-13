import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

/**
 * Create Milestone Request Body Schema
 */
export const createMilestoneBodySchema = z
  .object({
    title: z.string().min(1).max(255).openapi({
      example: "Q1 Milestone",
      description: "Milestone title",
    }),
    projectId: z.number().int().positive().optional().nullable().openapi({
      example: 1,
    }),
    assigneeUserId: z.uuid().optional().nullable().openapi({
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
    status: z.number().int().positive().optional().nullable().openapi({
      example: 1,
      description: "Progress status ID",
    }),
    dueDate: z.coerce.date().optional().nullable().openapi({
      example: "2025-03-01T00:00:00Z",
    }),
    description: z.string().max(1000).optional().nullable().openapi({
      example: "Complete initial design phase",
    }),
  })
  .openapi("CreateMilestoneBody");

export type CreateMilestoneBody = z.infer<typeof createMilestoneBodySchema>;

/**
 * Update Milestone Request Body Schema
 */
export const updateMilestoneBodySchema = z
  .object({
    title: z.string().min(1).max(255).optional().openapi({
      example: "Updated Q1 Milestone",
      description: "Milestone title",
    }),
    projectId: z.number().int().positive().optional().nullable().openapi({
      example: 1,
    }),
    assigneeUserId: z.uuid().optional().nullable().openapi({
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
    status: z.number().int().positive().optional().nullable().openapi({
      example: 1,
      description: "Progress status ID",
    }),
    dueDate: z.coerce.date().optional().nullable().openapi({
      example: "2025-03-15T00:00:00Z",
    }),
    description: z.string().max(1000).optional().nullable().openapi({
      example: "Updated milestone description",
    }),
  })
  .openapi("UpdateMilestoneBody");

export type UpdateMilestoneBody = z.infer<typeof updateMilestoneBodySchema>;

/**
 * Milestone ID Parameter Schema
 */
export const milestoneIdParamSchema = z
  .object({
    id: z.coerce.number().int().positive().openapi({ example: 1 }),
  })
  .openapi("MilestoneIdParam");

export type MilestoneIdParam = z.infer<typeof milestoneIdParamSchema>;

/**
 * Validation schemas for routes
 */
export const createMilestoneSchema = {
  body: createMilestoneBodySchema,
};

export const getMilestoneByIdSchema = {
  params: milestoneIdParamSchema,
};

export const getAllMilestonesSchema = {};

export const updateMilestoneSchema = {
  params: milestoneIdParamSchema,
  body: updateMilestoneBodySchema,
};

export const deleteMilestoneSchema = {
  params: milestoneIdParamSchema,
};

/**
 * Milestone Response Schema
 */
export const milestoneResponseSchema = z
  .object({
    id: z.number().int().positive().openapi({ example: 1 }),
    title: z.string().openapi({
      example: "Q1 Milestone",
      description: "Milestone title",
    }),
    projectId: z.number().int().positive().nullable().openapi({ example: 1 }),
    assigneeUserId: z.uuid().nullable().openapi({
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
    status: z.number().int().positive().nullable().openapi({
      example: 1,
      description: "Progress status ID",
    }),
    dueDate: z.date().nullable().openapi({ example: "2025-03-01T00:00:00Z" }),
    description: z.string().nullable().openapi({
      example: "Complete initial design phase",
    }),
    createdAt: z.date().openapi({ example: "2025-01-15T10:00:00Z" }),
    updatedAt: z.date().openapi({ example: "2025-01-15T10:00:00Z" }),
  })
  .openapi("MilestoneResponse");
