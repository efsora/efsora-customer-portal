import { command, fail, success, type Result } from "#lib/result";
import { companyRepository } from "#infrastructure/repositories/drizzle";
import type { CompanyIdInput, UpdateCompanyInput } from "../types/inputs";
import type { CompanyData } from "../types/outputs";
import { first } from "lodash";

/**
 * Update company in database
 */
export function updateCompanyById(
  input: CompanyIdInput & { updates: UpdateCompanyInput },
): Result<CompanyData> {
  return command(
    async () => {
      return await companyRepository.update(input.id, input.updates);
    },
    (result) => handleUpdateCompanyResult(result, input.id),
    {
      operation: "updateCompanyById",
      tags: { domain: "companies", action: "update" },
    },
  );
}

export function handleUpdateCompanyResult(
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
