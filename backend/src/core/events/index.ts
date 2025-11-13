/**
 * Events Module
 * Public API for event operations
 */

// Workflows
export { createEvent } from "./workflows/create-event";
export { getEventById, getAllEvents } from "./workflows/get-event";
export { updateEvent } from "./workflows/update-event";
export { deleteEvent } from "./workflows/delete-event";

// Public types - Inputs
export type {
  CreateEventInput,
  UpdateEventInput,
  EventIdInput,
} from "./types/inputs";

// Public types - Outputs
export type {
  EventData,
  CreateEventResult,
  UpdateEventResult,
  GetEventResult,
  GetAllEventsResult,
  DeleteEventResult,
} from "./types/outputs";

// Public types - Errors
export type {
  EventNotFoundError,
  EventValidationError,
  EventError,
} from "./types/errors";
