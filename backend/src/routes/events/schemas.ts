import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

/**
 * Create Event Request Body Schema
 */
export const createEventBodySchema = z
  .object({
    eventDatetime: z.coerce.date().openapi({
      example: "2025-01-15T10:00:00Z",
    }),
    description: z.string().optional().nullable().openapi({
      example: "Kickoff meeting completed",
    }),
    ownerUserId: z.uuid().optional().nullable().openapi({
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
    milestoneId: z.number().int().positive().optional().nullable().openapi({
      example: 1,
    }),
    status: z.number().int().positive().optional().nullable().openapi({
      example: 2,
    }),
  })
  .openapi("CreateEventBody");

export type CreateEventBody = z.infer<typeof createEventBodySchema>;

/**
 * Update Event Request Body Schema
 */
export const updateEventBodySchema = z
  .object({
    eventDatetime: z.coerce.date().optional().openapi({
      example: "2025-01-20T14:00:00Z",
    }),
    description: z.string().optional().nullable().openapi({
      example: "Updated event description",
    }),
    ownerUserId: z.uuid().optional().nullable().openapi({
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
    milestoneId: z.number().int().positive().optional().nullable().openapi({
      example: 1,
    }),
    status: z.number().int().positive().optional().nullable().openapi({
      example: 3,
    }),
  })
  .openapi("UpdateEventBody");

export type UpdateEventBody = z.infer<typeof updateEventBodySchema>;

/**
 * Event ID Parameter Schema
 */
export const eventIdParamSchema = z
  .object({
    id: z.coerce.number().int().positive().openapi({ example: 1 }),
  })
  .openapi("EventIdParam");

export type EventIdParam = z.infer<typeof eventIdParamSchema>;

/**
 * Event Response Schema
 */
export const eventResponseSchema = z
  .object({
    id: z.number().int().positive().openapi({ example: 1 }),
    eventDatetime: z.date().openapi({ example: "2025-01-15T10:00:00Z" }),
    description: z.string().nullable().openapi({
      example: "Kickoff meeting completed",
    }),
    ownerUserId: z.uuid().nullable().openapi({
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
    milestoneId: z.number().int().positive().nullable().openapi({ example: 1 }),
    status: z.number().int().positive().nullable().openapi({ example: 2 }),
    createdAt: z.date().openapi({ example: "2025-01-15T10:00:00Z" }),
    updatedAt: z.date().openapi({ example: "2025-01-15T10:00:00Z" }),
  })
  .openapi("EventResponse");
