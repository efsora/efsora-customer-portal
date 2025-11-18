/**
 * Companies Module
 * Public API for company operations
 */

// Workflows
export { createCompany } from "./workflows/create-company";
export { getCompanyById, getAllCompanies } from "./workflows/get-company";
export { updateCompany } from "./workflows/update-company";
export { deleteCompany } from "./workflows/delete-company";

// Public types - Inputs
export type {
  CreateCompanyInput,
  UpdateCompanyInput,
  CompanyIdInput,
} from "./types/inputs";

// Public types - Outputs
export type {
  CompanyData,
  CreateCompanyResult,
  UpdateCompanyResult,
  GetCompanyResult,
  GetAllCompaniesResult,
  DeleteCompanyResult,
} from "./types/outputs";

// Public types - Errors
export type {
  CompanyNotFoundError,
  CompanyValidationError,
  CompanyAlreadyExistsError,
  CompanyError,
} from "./types/errors";
