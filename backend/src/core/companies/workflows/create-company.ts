import { pipe, type Result } from "#lib/result";
import {
  checkCompanyNameExists,
  saveNewCompany,
} from "../operations/create-company";
import type { CreateCompanyInput } from "../types/inputs";
import type { CreateCompanyResult } from "../types/outputs";

/**
 * Create Company Workflow
 * 1. Check if company name already exists
 * 2. Save new company
 */
export function createCompany(
  input: CreateCompanyInput,
): Result<CreateCompanyResult> {
  return pipe(checkCompanyNameExists(input), saveNewCompany);
}
