import {
  createSuccessResponse,
  createFailureResponse,
  type AppResponse,
} from "#lib/types/response";
import { run, matchResponse } from "#lib/result";
import type { ValidatedRequest } from "#middlewares/validate";
import {
  createCompany,
  getCompanyById,
  getAllCompanies,
  updateCompany,
  deleteCompany,
} from "#core/companies";
import type {
  CreateCompanyResult,
  GetCompanyResult,
  GetAllCompaniesResult,
  UpdateCompanyResult,
  DeleteCompanyResult,
} from "#core/companies";
import type {
  CreateCompanyBody,
  UpdateCompanyBody,
  CompanyIdParam,
} from "./schemas";

/**
 * POST /api/v1/companies
 * Create a new company
 */
export async function handleCreateCompany(
  req: ValidatedRequest<{ body: CreateCompanyBody }>,
): Promise<AppResponse<CreateCompanyResult>> {
  const body = req.validated.body;

  const result = await run(
    createCompany({
      name: body.name,
      logoUrl: body.logoUrl,
      adminUserId: body.adminUserId,
    }),
  );

  return matchResponse(result, {
    onSuccess: (data) => createSuccessResponse(data),
    onFailure: (error) => createFailureResponse(error),
  });
}

/**
 * GET /api/v1/companies/:id
 * Get company by ID
 */
export async function handleGetCompanyById(
  req: ValidatedRequest<{ params: CompanyIdParam }>,
): Promise<AppResponse<GetCompanyResult>> {
  const { id } = req.validated.params;

  const result = await run(getCompanyById({ id }));

  return matchResponse(result, {
    onSuccess: (data) => createSuccessResponse(data),
    onFailure: (error) => createFailureResponse(error),
  });
}

/**
 * GET /api/v1/companies
 * Get all companies
 */
export async function handleGetAllCompanies(): Promise<
  AppResponse<GetAllCompaniesResult>
> {
  const result = await run(getAllCompanies());

  return matchResponse(result, {
    onSuccess: (data) => createSuccessResponse(data),
    onFailure: (error) => createFailureResponse(error),
  });
}

/**
 * PUT /api/v1/companies/:id
 * Update company
 */
export async function handleUpdateCompany(
  req: ValidatedRequest<{ params: CompanyIdParam; body: UpdateCompanyBody }>,
): Promise<AppResponse<UpdateCompanyResult>> {
  const { id } = req.validated.params;
  const body = req.validated.body;

  const result = await run(
    updateCompany({
      id,
      updates: body,
    }),
  );

  return matchResponse(result, {
    onSuccess: (data) => createSuccessResponse(data),
    onFailure: (error) => createFailureResponse(error),
  });
}

/**
 * DELETE /api/v1/companies/:id
 * Delete company
 */
export async function handleDeleteCompany(
  req: ValidatedRequest<{ params: CompanyIdParam }>,
): Promise<AppResponse<DeleteCompanyResult>> {
  const { id } = req.validated.params;

  const result = await run(deleteCompany({ id }));

  return matchResponse(result, {
    onSuccess: (data) => createSuccessResponse(data),
    onFailure: (error) => createFailureResponse(error),
  });
}
