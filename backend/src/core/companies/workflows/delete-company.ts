import { pipe, type Result } from "#lib/result";
import { findCompanyById } from "../operations/find-company";
import { deleteCompanyById } from "../operations/delete-company";
import type { CompanyIdInput } from "../types/inputs";
import type { DeleteCompanyResult } from "../types/outputs";

/**
 * Delete Company Workflow
 * 1. Verify company exists
 * 2. Delete company
 */
export function deleteCompany(
  input: CompanyIdInput,
): Result<DeleteCompanyResult> {
  return pipe(findCompanyById(input), () => deleteCompanyById(input));
}
