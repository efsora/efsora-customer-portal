import { type Result } from "#lib/result";
import { findCompanyById, findAllCompanies } from "../operations/find-company";
import type { CompanyIdInput } from "../types/inputs";
import type { GetCompanyResult, GetAllCompaniesResult } from "../types/outputs";

/**
 * Get Company By ID Workflow
 */
export function getCompanyById(
  input: CompanyIdInput,
): Result<GetCompanyResult> {
  return findCompanyById(input);
}

/**
 * Get All Companies Workflow
 */
export function getAllCompanies(): Result<GetAllCompaniesResult> {
  return findAllCompanies();
}
