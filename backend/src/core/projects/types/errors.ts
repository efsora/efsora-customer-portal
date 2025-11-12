/**
 * Project Error Types
 * Define error structures for project operations
 */

import type { ErrorBase } from "#lib/result/types/errors";

/**
 * Error when project is not found
 */
export type ProjectNotFoundError = ErrorBase & {
  code: "NOT_FOUND";
  resourceType: "project";
  resourceId: string | number;
};

/**
 * Error when project name already exists within a company
 */
export type ProjectNameConflictError = ErrorBase & {
  code: "CONFLICT";
  conflictType: "project_name";
  projectName: string;
  companyId: number;
};

/**
 * Error when company referenced by project does not exist
 */
export type CompanyNotFoundForProjectError = ErrorBase & {
  code: "NOT_FOUND";
  resourceType: "company";
  resourceId: string | number;
  context: "project_operation";
};

/**
 * Union type for all project-specific errors
 */
export type ProjectError =
  | ProjectNotFoundError
  | ProjectNameConflictError
  | CompanyNotFoundForProjectError;
