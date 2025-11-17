import { pipe, type Result } from "#lib/result";
import { findCompanyById } from "../operations/find-company";
import { updateCompanyById } from "../operations/update-company";
import type { CompanyIdInput, UpdateCompanyInput } from "../types/inputs";
import type { UpdateCompanyResult } from "../types/outputs";

/**
 * Update Company Workflow
 * 1. Verify company exists
 * 2. Update company
 */
export function updateCompany(
  input: CompanyIdInput & { updates: UpdateCompanyInput },
): Result<UpdateCompanyResult> {
  return pipe(findCompanyById({ id: input.id }), () =>
    updateCompanyById(input),
  );
}
