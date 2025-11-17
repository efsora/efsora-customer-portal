import { pipe, type Result } from "#lib/result";
import { findEventById } from "../operations/find-event";
import { deleteEventById } from "../operations/delete-event";
import type { EventIdInput } from "../types/inputs";
import type { DeleteEventResult } from "../types/outputs";

/**
 * Delete Event Workflow
 * 1. Verify event exists
 * 2. Delete event
 */
export function deleteEvent(input: EventIdInput): Result<DeleteEventResult> {
  return pipe(findEventById(input), () => deleteEventById(input));
}
