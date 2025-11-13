/**
 * Event Error Types
 */

import type { AppError } from "#lib/result/types/errors";

export type EventNotFoundError = AppError & {
  code: "NOT_FOUND";
  resourceType: "event";
  resourceId: number;
};

export type EventValidationError = AppError & {
  code: "VALIDATION_ERROR";
  field: string;
};

export type EventError = EventNotFoundError | EventValidationError;
