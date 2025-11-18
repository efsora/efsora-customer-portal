import { type Result } from "#lib/result";
import { findEventById, findAllEvents } from "../operations/find-event";
import type { EventIdInput } from "../types/inputs";
import type { GetEventResult, GetAllEventsResult } from "../types/outputs";

/**
 * Get Event By ID Workflow
 */
export function getEventById(input: EventIdInput): Result<GetEventResult> {
  return findEventById(input);
}

/**
 * Get All Events Workflow
 */
export function getAllEvents(): Result<GetAllEventsResult> {
  return findAllEvents();
}
