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
    name: z.string().nullable().openapi({ example: "Jane" }),
    surname: z.string().nullable().openapi({ example: "Doe" }),
    updatedAt: z.coerce.date().openapi({ example: "2025-10-29T10:30:00.000Z" }),
    projectId: z.number().nullable().openapi({ example: 1 }),
    companyId: z.number().nullable().openapi({ example: 1 }),
  })
  .openapi("UserData");

/**
 * Validation schemas for routes
 */
export const getUserSchema = {
  params: getUserParamsSchema,
};

export const getAllUsersSchema = {};

/**
 * Extended user response schema (includes company, role, project references)
 */
export const extendedUserDataSchema = z
  .object({
    id: z.uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
    email: z.email().openapi({ example: "jane.doe@example.com" }),
    name: z.string().nullable().openapi({ example: "Jane Doe" }),
    surname: z.string().nullable().openapi({ example: "Smith" }),
    bio: z
      .string()
      .nullable()
      .openapi({ example: "Senior developer with 10 years experience" }),
    companyId: z.number().int().nullable().openapi({ example: 1 }),
    roleId: z.number().int().nullable().openapi({ example: 3 }),
    projectId: z.number().int().nullable().openapi({ example: 5 }),
    createdAt: z.coerce.date().openapi({ example: "2025-10-29T10:30:00.000Z" }),
    updatedAt: z.coerce.date().openapi({ example: "2025-10-29T10:30:00.000Z" }),
  })
  .openapi("ExtendedUserData");

/**
 * Schema for assigning user to company
 */
export const assignToCompanyBodySchema = z
  .object({
    userId: z
      .uuid()
      .openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
    companyId: z.number().int().positive().openapi({ example: 1 }),
  })
  .openapi("AssignToCompanyBody");

/**
 * Schema for assigning user to project
 */
export const assignToProjectBodySchema = z
  .object({
    userId: z
      .uuid()
      .openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
    projectId: z.number().int().positive().openapi({ example: 5 }),
  })
  .openapi("AssignToProjectBody");

/**
 * Schema for assigning role to user
 */
export const assignRoleBodySchema = z
  .object({
    userId: z
      .uuid()
      .openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
    roleId: z.number().int().positive().openapi({ example: 3 }),
  })
  .openapi("AssignRoleBody");

/**
 * Schema for updating user profile
 */
export const updateProfileBodySchema = z
  .object({
    userId: z
      .uuid()
      .openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
    name: z.string().optional().openapi({ example: "Jane Doe" }),
    surname: z.string().optional().openapi({ example: "Smith" }),
    bio: z
      .string()
      .optional()
      .openapi({ example: "Senior developer with 10 years experience" }),
  })
  .openapi("UpdateProfileBody");

/**
 * Schema for updating user password
 */
export const updatePasswordBodySchema = z
  .object({
    userId: z
      .uuid()
      .openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
    currentPassword: z
      .string()
      .min(1)
      .openapi({ example: "currentPassword123" }),
    newPassword: z.string().min(8).openapi({ example: "newPassword123" }),
  })
  .openapi("UpdatePasswordBody");

/**
 * Validation schemas for routes
 */
export const assignToCompanySchema = {
  body: assignToCompanyBodySchema,
};

export const assignToProjectSchema = {
  body: assignToProjectBodySchema,
};

export const assignRoleSchema = {
  body: assignRoleBodySchema,
};

export const updateProfileSchema = {
  body: updateProfileBodySchema,
};

export const updatePasswordSchema = {
  body: updatePasswordBodySchema,
};

export type GetUserParams = z.infer<typeof getUserParamsSchema>;
export type UserDataResponse = z.infer<typeof userDataSchema>;
export type ExtendedUserDataResponse = z.infer<typeof extendedUserDataSchema>;
export type AssignToCompanyBody = z.infer<typeof assignToCompanyBodySchema>;
export type AssignToProjectBody = z.infer<typeof assignToProjectBodySchema>;
export type AssignRoleBody = z.infer<typeof assignRoleBodySchema>;
export type UpdateProfileBody = z.infer<typeof updateProfileBodySchema>;
export type UpdatePasswordBody = z.infer<typeof updatePasswordBodySchema>;
