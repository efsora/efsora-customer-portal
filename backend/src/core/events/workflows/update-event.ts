import { pipe, type Result } from "#lib/result";
import { findEventById } from "../operations/find-event";
import { updateEventById } from "../operations/update-event";
import type { EventIdInput, UpdateEventInput } from "../types/inputs";
import type { UpdateEventResult } from "../types/outputs";

/**
 * Update Event Workflow
 * 1. Verify event exists
 * 2. Update event
 */
export function updateEvent(
  input: EventIdInput & { updates: UpdateEventInput },
): Result<UpdateEventResult> {
  return pipe(findEventById({ id: input.id }), () => updateEventById(input));
}
