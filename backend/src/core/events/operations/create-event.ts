import { command, fail, success, type Result } from "#lib/result";
import { eventRepository } from "#infrastructure/repositories/drizzle";
import type { CreateEventInput } from "../types/inputs";
import type { EventData } from "../types/outputs";
import first from "lodash/fp/first";

/**
 * Save new event to database
 */
export function saveNewEvent(input: CreateEventInput): Result<EventData> {
  return command(async () => {
    return await eventRepository.create({
      eventDatetime: input.eventDatetime,
      description: input.description ?? null,
      ownerUserId: input.ownerUserId ?? null,
      milestoneId: input.milestoneId ?? null,
      status: input.status ?? null,
    });
  }, handleSaveNewEventResult);
}

export function handleSaveNewEventResult(result: unknown): Result<EventData> {
  const events = result as EventData[];
  const event = first(events);

  if (!event) {
    return fail({
      code: "INTERNAL_ERROR",
      message: "Failed to create event",
    });
  }

  return success({
    id: event.id,
    eventDatetime: event.eventDatetime,
    description: event.description,
    ownerUserId: event.ownerUserId,
    milestoneId: event.milestoneId,
    status: event.status,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  });
}
