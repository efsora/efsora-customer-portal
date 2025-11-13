import { handleResult } from "#middlewares/resultHandler";
import { validate } from "#middlewares/validate";
import { auth } from "#middlewares/auth";
import { Router } from "express";

import {
  handleCreateEvent,
  handleGetEventById,
  handleGetAllEvents,
  handleUpdateEvent,
  handleDeleteEvent,
} from "./handlers";
import {
  createEventBodySchema,
  updateEventBodySchema,
  eventIdParamSchema,
} from "./schemas";

const router = Router();

/**
 * POST /events
 * Create a new event (protected)
 */
router.post(
  "/",
  auth,
  validate({ body: createEventBodySchema }),
  handleResult(handleCreateEvent),
);

/**
 * GET /events/:id
 * Get event by ID (protected)
 */
router.get(
  "/:id",
  auth,
  validate({ params: eventIdParamSchema }),
  handleResult(handleGetEventById),
);

/**
 * GET /events
 * Get all events (protected)
 */
router.get("/", auth, handleResult(handleGetAllEvents));

/**
 * PUT /events/:id
 * Update event (protected)
 */
router.put(
  "/:id",
  auth,
  validate({ params: eventIdParamSchema, body: updateEventBodySchema }),
  handleResult(handleUpdateEvent),
);

/**
 * DELETE /events/:id
 * Delete event (protected)
 */
router.delete(
  "/:id",
  auth,
  validate({ params: eventIdParamSchema }),
  handleResult(handleDeleteEvent),
);

export default router;
