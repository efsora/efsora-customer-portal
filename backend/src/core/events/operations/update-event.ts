import { command, fail, success, type Result } from "#lib/result";
import { eventRepository } from "#infrastructure/repositories/drizzle";
import type { EventIdInput, UpdateEventInput } from "../types/inputs";
import type { EventData } from "../types/outputs";
import first from "lodash/fp/first";

/**
 * Update event in database
 */
export function updateEventById(
  input: EventIdInput & { updates: UpdateEventInput },
): Result<EventData> {
  return command(
    async () => {
      return await eventRepository.update(input.id, input.updates);
    },
    (result) => handleUpdateEventResult(result, input.id),
  );
}

export function handleUpdateEventResult(
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
