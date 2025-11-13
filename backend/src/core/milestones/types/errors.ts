/**
 * Milestone Error Types
 */

import type { ErrorBase } from "#lib/result/types/errors";

export type MilestoneNotFoundError = ErrorBase & {
  code: "NOT_FOUND";
  resourceType: "milestone";
  resourceId: number;
};

export type MilestoneValidationError = ErrorBase & {
  code: "VALIDATION_ERROR";
  field: string;
};

export type MilestoneError = MilestoneNotFoundError | MilestoneValidationError;
