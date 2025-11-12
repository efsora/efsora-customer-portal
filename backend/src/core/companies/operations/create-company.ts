import { command, fail, success, type Result } from "#lib/result";
import { companyRepository } from "#infrastructure/repositories/drizzle";
import type { CreateCompanyInput } from "../types/inputs";
import type { CompanyData } from "../types/outputs";
import { first } from "lodash";

/**
 * Check if company name already exists
 */
export function checkCompanyNameExists(
  input: CreateCompanyInput,
): Result<CreateCompanyInput> {
  return command(
    async () => {
      // Use optimized findByName method
      const existingCompanies = await companyRepository.findByName(input.name);
      return { duplicate: existingCompanies.length > 0, input };
    },
    (result: { duplicate: boolean; input: CreateCompanyInput }) => {
      if (result.duplicate) {
        return fail({
          code: "CONFLICT",
          message: `Company with name "${input.name}" already exists`,
          conflictType: "company_name",
          companyName: input.name,
        });
      }
      return success(result.input);
    },
    {
      operation: "checkCompanyNameExists",
      tags: { domain: "companies", action: "validate" },
    },
  );
}

/**
 * Save new company to database
 */
export function saveNewCompany(input: CreateCompanyInput): Result<CompanyData> {
  return command(
    async () => {
      return await companyRepository.create({
        name: input.name,
        logoUrl: input.logoUrl ?? null,
        adminUserId: input.adminUserId ?? null,
      });
    },
    handleSaveNewCompanyResult,
    {
      operation: "saveNewCompany",
      tags: { domain: "companies", action: "create" },
    },
  );
}

export function handleSaveNewCompanyResult(
  result: unknown,
): Result<CompanyData> {
  const companies = result as CompanyData[];
  const company = first(companies);

  if (!company) {
    return fail({
      code: "INTERNAL_ERROR",
      message: "Failed to create company",
    });
  }

  return success({
    id: company.id,
    name: company.name,
    logoUrl: company.logoUrl,
    adminUserId: company.adminUserId,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
  });
}
