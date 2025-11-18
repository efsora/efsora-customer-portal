import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

/**
 * Schema for user registration body
 */
export const registerBodySchema = z
  .object({
    email: z
      .email("Invalid email format")
      .openapi({ example: "jane.doe@example.com" }),
    name: z.string().min(1, "Name is required").openapi({ example: "Jane" }),
    surname: z
      .string()
      .min(1, "Surname is required")
      .openapi({ example: "Doe" }),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .openapi({ example: "securePassword123" }),
  })
  .openapi("RegisterBody");

/**
 * Schema for user login body
 */
export const loginBodySchema = z
  .object({
    email: z
      .email("Invalid email format")
      .openapi({ example: "jane.doe@example.com" }),
    password: z.string().openapi({ example: "securePassword123" }),
  })
  .openapi("LoginBody");

/**
 * Schema for user data in responses (without password)
 */
export const userDataSchema = z
  .object({
    createdAt: z.coerce.date().openapi({ example: "2025-10-29T10:30:00.000Z" }),
    email: z.email().openapi({ example: "jane.doe@example.com" }),
    id: z.uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
    name: z.string().nullable().openapi({ example: "Jane" }),
    surname: z.string().nullable().openapi({ example: "Doe" }),
    updatedAt: z.coerce.date().openapi({ example: "2025-10-29T10:30:00.000Z" }),
  })
  .openapi("UserData");

/**
 * Registration response schema (nested: user + token)
 * Best practice: separates user data from authentication token
 * Uses userDataSchema to ensure consistency with login response and include timestamps
 */
export const registerResponseSchema = z
  .object({
    user: z
      .object({
        email: z.email().openapi({ example: "jane.doe@example.com" }),
        id: z
          .uuid()
          .openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
        name: z.string().nullable().openapi({ example: "Jane" }),
        surname: z.string().nullable().openapi({ example: "Doe" }),
      })
      .openapi("RegisterUserData"),
    token: z
      .string()
      .openapi({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }),
  })
  .openapi("RegisterResponse");

/**
 * Login response schema (user + token)
 */
export const loginResponseSchema = z
  .object({
    user: userDataSchema,
    token: z
      .string()
      .openapi({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }),
  })
  .openapi("LoginResponse");

/**
 * Logout response schema
 */
export const logoutResponseSchema = z
  .object({
    message: z.string().openapi({ example: "Logged out successfully" }),
  })
  .openapi("LogoutResponse");

/**
 * Validation schemas for routes
 */
export const registerSchema = {
  body: registerBodySchema,
};

export const loginSchema = {
  body: loginBodySchema,
};

export type RegisterBody = z.infer<typeof registerBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;
export type RegisterResponse = z.infer<typeof registerResponseSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type LogoutResponse = z.infer<typeof logoutResponseSchema>;
export type UserDataResponse = z.infer<typeof userDataSchema>;
