import { command, fail, success, type Result } from "#lib/result";
import { companyRepository } from "#infrastructure/repositories/drizzle";
import type { CompanyIdInput } from "../types/inputs";
import type { DeleteCompanyResult } from "../types/outputs";
import { first } from "lodash";

/**
 * Delete company from database
 */
export function deleteCompanyById(
  input: CompanyIdInput,
): Result<DeleteCompanyResult> {
  return command(
    async () => {
      return await companyRepository.delete(input.id);
    },
    (result) => handleDeleteCompanyResult(result, input.id),
  );
}

export function handleDeleteCompanyResult(
  result: unknown,
  companyId: number,
): Result<DeleteCompanyResult> {
  const companies = result as { id: number }[];
  const company = first(companies);

  if (!company) {
    return fail({
      code: "NOT_FOUND",
      message: `Company with ID ${String(companyId)} not found`,
      resourceType: "company",
      resourceId: String(companyId),
    });
  }

  return success({
    id: company.id,
    message: "Company deleted successfully",
  });
}
