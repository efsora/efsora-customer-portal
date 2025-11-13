import { command, fail, success, type Result } from "#lib/result";
import { companyRepository } from "#infrastructure/repositories/drizzle";
import type { CompanyIdInput } from "../types/inputs";
import type { CompanyData } from "../types/outputs";
import first from "lodash/fp/first";

/**
 * Find company by ID
 */
export function findCompanyById(input: CompanyIdInput): Result<CompanyData> {
  return command(
    async () => {
      return await companyRepository.findById(input.id);
    },
    (result) => handleFindCompanyByIdResult(result, input.id),
  );
}

export function handleFindCompanyByIdResult(
  result: unknown,
  companyId: number,
): Result<CompanyData> {
  const companies = result as CompanyData[];
  const company = first(companies);

  if (!company) {
    return fail({
      code: "NOT_FOUND",
      message: `Company with ID ${String(companyId)} not found`,
      resourceType: "company",
      resourceId: String(companyId),
    });
  }

  return success(company);
}

/**
 * Find all companies
 */
export function findAllCompanies(): Result<CompanyData[]> {
  return command(async () => {
    return await companyRepository.findAll();
  }, handleFindAllCompaniesResult);
}

export function handleFindAllCompaniesResult(
  result: unknown,
): Result<CompanyData[]> {
  const companies = result as CompanyData[];
  return success(companies);
}
