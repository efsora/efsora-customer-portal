import {
  createSuccessResponse,
  createFailureResponse,
  type AppResponse,
} from "#lib/types/response";
import { run, matchResponse } from "#lib/result";
import type { ValidatedRequest } from "#middlewares/validate";
import {
  createEvent,
  getEventById,
  getAllEvents,
  updateEvent,
  deleteEvent,
} from "#core/events";
import type {
  CreateEventResult,
  GetEventResult,
  GetAllEventsResult,
  UpdateEventResult,
  DeleteEventResult,
} from "#core/events";
import type { CreateEventBody, UpdateEventBody, EventIdParam } from "./schemas";

/**
 * POST /api/v1/events
 * Create a new event
 */
export async function handleCreateEvent(
  req: ValidatedRequest<{ body: CreateEventBody }>,
): Promise<AppResponse<CreateEventResult>> {
  const body = req.validated.body;

  const result = await run(
    createEvent({
      eventDatetime: body.eventDatetime,
      description: body.description,
      ownerUserId: body.ownerUserId,
      milestoneId: body.milestoneId,
      status: body.status,
    }),
  );

  return matchResponse(result, {
    onSuccess: (data) => createSuccessResponse(data),
    onFailure: (error) => createFailureResponse(error),
  });
}

/**
 * GET /api/v1/events/:id
 * Get event by ID
 */
export async function handleGetEventById(
  req: ValidatedRequest<{ params: EventIdParam }>,
): Promise<AppResponse<GetEventResult>> {
  const { id } = req.validated.params;

  const result = await run(getEventById({ id }));

  return matchResponse(result, {
    onSuccess: (data) => createSuccessResponse(data),
    onFailure: (error) => createFailureResponse(error),
  });
}

/**
 * GET /api/v1/events
 * Get all events
 */
export async function handleGetAllEvents(): Promise<
  AppResponse<GetAllEventsResult>
> {
  const result = await run(getAllEvents());

  return matchResponse(result, {
    onSuccess: (data) => createSuccessResponse(data),
    onFailure: (error) => createFailureResponse(error),
  });
}

/**
 * PUT /api/v1/events/:id
 * Update event
 */
export async function handleUpdateEvent(
  req: ValidatedRequest<{ params: EventIdParam; body: UpdateEventBody }>,
): Promise<AppResponse<UpdateEventResult>> {
  const { id } = req.validated.params;
  const body = req.validated.body;

  const result = await run(
    updateEvent({
      id,
      updates: body,
    }),
  );

  return matchResponse(result, {
    onSuccess: (data) => createSuccessResponse(data),
    onFailure: (error) => createFailureResponse(error),
  });
}

/**
 * DELETE /api/v1/events/:id
 * Delete event
 */
export async function handleDeleteEvent(
  req: ValidatedRequest<{ params: EventIdParam }>,
): Promise<AppResponse<DeleteEventResult>> {
  const { id } = req.validated.params;

  const result = await run(deleteEvent({ id }));

  return matchResponse(result, {
    onSuccess: (data) => createSuccessResponse(data),
    onFailure: (error) => createFailureResponse(error),
  });
}
