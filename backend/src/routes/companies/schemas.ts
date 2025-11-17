import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

/**
 * Create Company Request Body Schema
 */
export const createCompanyBodySchema = z
  .object({
    name: z.string().min(3).max(200).openapi({ example: "Acme Corporation" }),
    logoUrl: z.url().optional().nullable().openapi({
      example: "https://example.com/logo.png",
    }),
    adminUserId: z.uuid().optional().nullable().openapi({
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
  })
  .openapi("CreateCompanyBody");

export type CreateCompanyBody = z.infer<typeof createCompanyBodySchema>;

/**
 * Update Company Request Body Schema
 */
export const updateCompanyBodySchema = z
  .object({
    name: z.string().min(3).max(200).optional().openapi({
      example: "Updated Company Name",
    }),
    logoUrl: z.url().optional().nullable().openapi({
      example: "https://example.com/new-logo.png",
    }),
    adminUserId: z.uuid().optional().nullable().openapi({
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
  })
  .openapi("UpdateCompanyBody");

export type UpdateCompanyBody = z.infer<typeof updateCompanyBodySchema>;

/**
 * Company ID Parameter Schema
 */
export const companyIdParamSchema = z
  .object({
    id: z.coerce.number().int().positive().openapi({ example: 1 }),
  })
  .openapi("CompanyIdParam");

export type CompanyIdParam = z.infer<typeof companyIdParamSchema>;

/**
 * Validation schemas for routes
 */
export const createCompanySchema = {
  body: createCompanyBodySchema,
};

export const getCompanyByIdSchema = {
  params: companyIdParamSchema,
};

export const getAllCompaniesSchema = {};

export const updateCompanySchema = {
  params: companyIdParamSchema,
  body: updateCompanyBodySchema,
};

export const deleteCompanySchema = {
  params: companyIdParamSchema,
};

/**
 * Company Response Schema
 */
export const companyResponseSchema = z
  .object({
    id: z.number().int().positive().openapi({ example: 1 }),
    name: z.string().openapi({ example: "Acme Corporation" }),
    logoUrl: z.url().nullable().openapi({
      example: "https://example.com/logo.png",
    }),
    adminUserId: z.uuid().nullable().openapi({
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
    createdAt: z.date().openapi({ example: "2025-01-15T10:00:00Z" }),
    updatedAt: z.date().openapi({ example: "2025-01-15T10:00:00Z" }),
  })
  .openapi("CompanyResponse");
