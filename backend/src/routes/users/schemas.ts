import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

/**
 * Schema for user ID parameter
 */
export const getUserParamsSchema = z
  .object({
    id: z.uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
  })
  .openapi("GetUserParams");

/**
 * User response schema (without password)
 */
export const userDataSchema = z
  .object({
    createdAt: z.coerce.date().openapi({ example: "2025-10-29T10:30:00.000Z" }),
    email: z.email().openapi({ example: "jane.doe@example.com" }),
    id: z.uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
    name: z.string().nullable().openapi({ example: "Jane Doe" }),
    updatedAt: z.coerce.date().openapi({ example: "2025-10-29T10:30:00.000Z" }),
  })
  .openapi("UserData");

/**
 * Validation schemas for routes
 */
export const getUserSchema = {
  params: getUserParamsSchema,
};

export const getAllUsersSchema = {};

export type GetUserParams = z.infer<typeof getUserParamsSchema>;
export type UserDataResponse = z.infer<typeof userDataSchema>;
