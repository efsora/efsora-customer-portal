/**
 * Company Error Types
 */

import type { ErrorBase } from "#lib/result/types/errors";

export type CompanyNotFoundError = ErrorBase & {
  code: "NOT_FOUND";
  resourceType: "company";
  resourceId: string | number;
};

export type CompanyValidationError = ErrorBase & {
  code: "VALIDATION_ERROR";
  field: string;
};

export type CompanyAlreadyExistsError = ErrorBase & {
  code: "CONFLICT";
  conflictType: "company_name";
  companyName: string;
};

export type CompanyError =
  | CompanyNotFoundError
  | CompanyValidationError
  | CompanyAlreadyExistsError;
