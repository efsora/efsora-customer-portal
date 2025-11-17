import { command, fail, success, type Result } from "#lib/result";
import { eventRepository } from "#infrastructure/repositories/drizzle";
import type { EventIdInput } from "../types/inputs";
import type { DeleteEventResult } from "../types/outputs";
import first from "lodash/fp/first";

/**
 * Delete event from database
 */
export function deleteEventById(
  input: EventIdInput,
): Result<DeleteEventResult> {
  return command(
    async () => {
      return await eventRepository.delete(input.id);
    },
    (result) => handleDeleteEventResult(result, input.id),
  );
}

export function handleDeleteEventResult(
  result: unknown,
  eventId: number,
): Result<DeleteEventResult> {
  const events = result as { id: number }[];
  const event = first(events);

  if (!event) {
    return fail({
      code: "NOT_FOUND",
      message: `Event with ID ${String(eventId)} not found`,
      resourceType: "event",
      resourceId: eventId,
    });
  }

  return success({
    id: event.id,
    message: "Event deleted successfully",
  });
}
