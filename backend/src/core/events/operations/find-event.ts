import { command, fail, success, type Result } from "#lib/result";
import { eventRepository } from "#infrastructure/repositories/drizzle";
import type { EventIdInput } from "../types/inputs";
import type { EventData } from "../types/outputs";
import first from "lodash/fp/first";

/**
 * Find event by ID
 */
export function findEventById(input: EventIdInput): Result<EventData> {
  return command(
    async () => {
      return await eventRepository.findById(input.id);
    },
    (result) => handleFindEventByIdResult(result, input.id),
  );
}

export function handleFindEventByIdResult(
  result: unknown,
  eventId: number,
): Result<EventData> {
  const events = result as EventData[];
  const event = first(events);

  if (!event) {
    return fail({
      code: "NOT_FOUND",
      message: `Event with ID ${String(eventId)} not found`,
      resourceType: "event",
      resourceId: eventId,
    });
  }

  return success(event);
}

/**
 * Find all events
 */
export function findAllEvents(): Result<EventData[]> {
  return command(async () => {
    return await eventRepository.findAll();
  }, handleFindAllEventsResult);
}

export function handleFindAllEventsResult(
  result: unknown,
): Result<EventData[]> {
  const events = result as EventData[];
  return success(events);
}
