import { type Result } from "#lib/result";
import { saveNewEvent } from "../operations/create-event";
import type { CreateEventInput } from "../types/inputs";
import type { CreateEventResult } from "../types/outputs";

/**
 * Create Event Workflow
 * 1. Save new event
 */
export function createEvent(
  input: CreateEventInput,
): Result<CreateEventResult> {
  return saveNewEvent(input);
}
