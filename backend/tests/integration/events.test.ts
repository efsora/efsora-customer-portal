/**
 * Events Module Integration Tests
 *
 * Tests the complete events workflow including:
 * - Event creation
 * - Event retrieval (by ID and all)
 * - Event updates
 * - Event deletion
 * - Event not found scenarios
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import {
  setupTestDatabase,
  cleanupDatabase,
  teardownTestDatabase,
} from "../helpers/database";
import { run } from "#lib/result";
import {
  createEvent,
  getEventById,
  getAllEvents,
  updateEvent,
  deleteEvent,
} from "#core/events";

describe("Events Module Integration Tests", () => {
  // Setup: Start container and run migrations (once for all tests)
  beforeAll(async () => {
    await setupTestDatabase();
  }, 60000); // 60s timeout for container startup

  // Cleanup: Truncate tables before each test for isolation
  beforeEach(async () => {
    await cleanupDatabase();
  });

  // Teardown: Stop container after all tests
  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe("createEvent", () => {
    it("should create event successfully with all fields", async () => {
      const input = {
        eventDatetime: new Date("2025-01-15T10:00:00Z"),
        description: "Kickoff meeting completed",
        ownerUserId: "550e8400-e29b-12d3-a456-426614174000",
        milestoneId: 1,
        status: 6,
      };

      const result = await run(createEvent(input));

      expect(result.status).toBe("Success");
      if (result.status === "Success") {
        expect(result.value.id).toBeTypeOf("number");
        expect(result.value.eventDatetime).toEqual(input.eventDatetime);
        expect(result.value.description).toBe(input.description);
        expect(result.value.ownerUserId).toBe(input.ownerUserId);
        expect(result.value.milestoneId).toBe(input.milestoneId);
        expect(result.value.status).toBe(input.status);
        expect(result.value.createdAt).toBeInstanceOf(Date);
        expect(result.value.updatedAt).toBeInstanceOf(Date);
      }
    });

    it("should create event with only required field (eventDatetime)", async () => {
      const input = {
        eventDatetime: new Date("2025-01-20T14:00:00Z"),
      };

      const result = await run(createEvent(input));

      expect(result.status).toBe("Success");
      if (result.status === "Success") {
        expect(result.value.eventDatetime).toEqual(input.eventDatetime);
        expect(result.value.description).toBeNull();
        expect(result.value.ownerUserId).toBeNull();
        expect(result.value.milestoneId).toBeNull();
        expect(result.value.status).toBeNull();
      }
    });

    it("should create event with partial fields", async () => {
      const input = {
        eventDatetime: new Date("2025-02-01T09:00:00Z"),
        description: "Design review meeting",
        status: 4,
      };

      const result = await run(createEvent(input));

      expect(result.status).toBe("Success");
      if (result.status === "Success") {
        expect(result.value.eventDatetime).toEqual(input.eventDatetime);
        expect(result.value.description).toBe(input.description);
        expect(result.value.status).toBe(input.status);
        expect(result.value.ownerUserId).toBeNull();
        expect(result.value.milestoneId).toBeNull();
      }
    });

    it("should persist event and be retrievable", async () => {
      const input = {
        eventDatetime: new Date("2025-01-25T11:00:00Z"),
        description: "Sprint planning completed",
      };

      const createResult = await run(createEvent(input));

      expect(createResult.status).toBe("Success");
      if (createResult.status === "Success") {
        // Verify by retrieving the event
        const getResult = await run(
          getEventById({ id: createResult.value.id }),
        );

        expect(getResult.status).toBe("Success");
        if (getResult.status === "Success") {
          expect(getResult.value.description).toBe(input.description);
        }
      }
    });
  });

  describe("getEventById", () => {
    it("should retrieve event by ID successfully", async () => {
      // Create test event
      const createResult = await run(
        createEvent({
          eventDatetime: new Date("2025-01-15T10:00:00Z"),
          description: "Test event",
          status: 2,
        }),
      );

      expect(createResult.status).toBe("Success");
      if (createResult.status === "Success") {
        const eventId = createResult.value.id;

        // Retrieve event
        const result = await run(getEventById({ id: eventId }));

        expect(result.status).toBe("Success");
        if (result.status === "Success") {
          expect(result.value.id).toBe(eventId);
          expect(result.value.description).toBe("Test event");
          expect(result.value.status).toBe(2);
        }
      }
    });

    it("should return NOT_FOUND for non-existent event", async () => {
      const result = await run(getEventById({ id: 99999 }));

      expect(result.status).toBe("Failure");
      if (result.status === "Failure") {
        expect(result.error.code).toBe("NOT_FOUND");
        expect(result.error.message).toContain("Event with ID 99999 not found");
      }
    });

    it("should retrieve event with all nullable fields", async () => {
      // Create event with all fields
      const createResult = await run(
        createEvent({
          eventDatetime: new Date("2025-02-01T09:00:00Z"),
          description: "Complete event data",
          ownerUserId: "550e8400-e29b-12d3-a456-426614174000",
          milestoneId: 5,
          status: 3,
        }),
      );

      expect(createResult.status).toBe("Success");
      if (createResult.status === "Success") {
        const result = await run(getEventById({ id: createResult.value.id }));

        expect(result.status).toBe("Success");
        if (result.status === "Success") {
          expect(result.value.description).toBe("Complete event data");
          expect(result.value.ownerUserId).toBe(
            "550e8400-e29b-12d3-a456-426614174000",
          );
          expect(result.value.milestoneId).toBe(5);
          expect(result.value.status).toBe(3);
        }
      }
    });
  });

  describe("getAllEvents", () => {
    it("should retrieve all events successfully", async () => {
      // Create multiple events
      await run(
        createEvent({
          eventDatetime: new Date("2025-01-15T10:00:00Z"),
          description: "Event 1",
        }),
      );
      await run(
        createEvent({
          eventDatetime: new Date("2025-01-20T14:00:00Z"),
          description: "Event 2",
        }),
      );
      await run(
        createEvent({
          eventDatetime: new Date("2025-01-25T09:00:00Z"),
          description: "Event 3",
        }),
      );

      const result = await run(getAllEvents());

      expect(result.status).toBe("Success");
      if (result.status === "Success") {
        expect(result.value).toHaveLength(3);
        expect(result.value[0].description).toBe("Event 1");
        expect(result.value[1].description).toBe("Event 2");
        expect(result.value[2].description).toBe("Event 3");
      }
    });

    it("should return empty array when no events exist", async () => {
      const result = await run(getAllEvents());

      expect(result.status).toBe("Success");
      if (result.status === "Success") {
        expect(result.value).toHaveLength(0);
        expect(result.value).toEqual([]);
      }
    });

    it("should retrieve events with different statuses", async () => {
      await run(
        createEvent({
          eventDatetime: new Date("2025-01-15T10:00:00Z"),
          description: "Scheduled",
          status: 1,
        }),
      );
      await run(
        createEvent({
          eventDatetime: new Date("2025-01-20T14:00:00Z"),
          description: "In Progress",
          status: 2,
        }),
      );
      await run(
        createEvent({
          eventDatetime: new Date("2025-01-25T09:00:00Z"),
          description: "Completed",
          status: 6,
        }),
      );

      const result = await run(getAllEvents());

      expect(result.status).toBe("Success");
      if (result.status === "Success") {
        expect(result.value).toHaveLength(3);

        const statuses = result.value.map((event) => event.status);
        expect(statuses).toContain(1);
        expect(statuses).toContain(2);
        expect(statuses).toContain(6);
      }
    });
  });

  describe("updateEvent", () => {
    it("should update event description successfully", async () => {
      // Create test event
      const createResult = await run(
        createEvent({
          eventDatetime: new Date("2025-01-15T10:00:00Z"),
          description: "Original description",
        }),
      );

      expect(createResult.status).toBe("Success");
      if (createResult.status === "Success") {
        const eventId = createResult.value.id;

        // Update event
        const result = await run(
          updateEvent({
            id: eventId,
            updates: {
              description: "Updated description",
            },
          }),
        );

        expect(result.status).toBe("Success");
        if (result.status === "Success") {
          expect(result.value.id).toBe(eventId);
          expect(result.value.description).toBe("Updated description");
          expect(result.value.eventDatetime).toEqual(
            createResult.value.eventDatetime,
          );
        }
      }
    });

    it("should update event datetime successfully", async () => {
      const originalDate = new Date("2025-01-15T10:00:00Z");
      const updatedDate = new Date("2025-02-20T14:30:00Z");

      const createResult = await run(
        createEvent({
          eventDatetime: originalDate,
          description: "Test event",
        }),
      );

      expect(createResult.status).toBe("Success");
      if (createResult.status === "Success") {
        const result = await run(
          updateEvent({
            id: createResult.value.id,
            updates: {
              eventDatetime: updatedDate,
            },
          }),
        );

        expect(result.status).toBe("Success");
        if (result.status === "Success") {
          expect(result.value.eventDatetime).toEqual(updatedDate);
        }
      }
    });

    it("should update multiple fields simultaneously", async () => {
      const createResult = await run(
        createEvent({
          eventDatetime: new Date("2025-01-15T10:00:00Z"),
          description: "Original",
          status: 1,
        }),
      );

      expect(createResult.status).toBe("Success");
      if (createResult.status === "Success") {
        const result = await run(
          updateEvent({
            id: createResult.value.id,
            updates: {
              description: "Updated",
              status: 6,
              ownerUserId: "550e8400-e29b-12d3-a456-426614174000",
              milestoneId: 3,
            },
          }),
        );

        expect(result.status).toBe("Success");
        if (result.status === "Success") {
          expect(result.value.description).toBe("Updated");
          expect(result.value.status).toBe(6);
          expect(result.value.ownerUserId).toBe(
            "550e8400-e29b-12d3-a456-426614174000",
          );
          expect(result.value.milestoneId).toBe(3);
        }
      }
    });

    it("should update event status to null", async () => {
      const createResult = await run(
        createEvent({
          eventDatetime: new Date("2025-01-15T10:00:00Z"),
          status: 2,
        }),
      );

      expect(createResult.status).toBe("Success");
      if (createResult.status === "Success") {
        const result = await run(
          updateEvent({
            id: createResult.value.id,
            updates: {
              status: null,
            },
          }),
        );

        expect(result.status).toBe("Success");
        if (result.status === "Success") {
          expect(result.value.status).toBeNull();
        }
      }
    });

    it("should return NOT_FOUND for non-existent event", async () => {
      const result = await run(
        updateEvent({
          id: 99999,
          updates: {
            description: "Updated",
          },
        }),
      );

      expect(result.status).toBe("Failure");
      if (result.status === "Failure") {
        expect(result.error.code).toBe("NOT_FOUND");
        expect(result.error.message).toContain("Event with ID 99999 not found");
      }
    });

    it("should update updatedAt timestamp", async () => {
      const createResult = await run(
        createEvent({
          eventDatetime: new Date("2025-01-15T10:00:00Z"),
          description: "Test",
        }),
      );

      expect(createResult.status).toBe("Success");
      if (createResult.status === "Success") {
        const originalUpdatedAt = createResult.value.updatedAt;

        // Wait a bit to ensure timestamp difference
        await new Promise((resolve) => setTimeout(resolve, 100));

        const result = await run(
          updateEvent({
            id: createResult.value.id,
            updates: {
              description: "Updated",
            },
          }),
        );

        expect(result.status).toBe("Success");
        if (result.status === "Success") {
          expect(result.value.updatedAt.getTime()).toBeGreaterThan(
            originalUpdatedAt.getTime(),
          );
        }
      }
    });
  });

  describe("deleteEvent", () => {
    it("should delete event successfully", async () => {
      // Create test event
      const createResult = await run(
        createEvent({
          eventDatetime: new Date("2025-01-15T10:00:00Z"),
          description: "To be deleted",
        }),
      );

      expect(createResult.status).toBe("Success");
      if (createResult.status === "Success") {
        const eventId = createResult.value.id;

        // Delete event
        const result = await run(deleteEvent({ id: eventId }));

        expect(result.status).toBe("Success");
        if (result.status === "Success") {
          expect(result.value.id).toBe(eventId);
          expect(result.value.message).toBe("Event deleted successfully");
        }

        // Verify deletion
        const getResult = await run(getEventById({ id: eventId }));
        expect(getResult.status).toBe("Failure");
        if (getResult.status === "Failure") {
          expect(getResult.error.code).toBe("NOT_FOUND");
        }
      }
    });

    it("should return NOT_FOUND for non-existent event", async () => {
      const result = await run(deleteEvent({ id: 99999 }));

      expect(result.status).toBe("Failure");
      if (result.status === "Failure") {
        expect(result.error.code).toBe("NOT_FOUND");
        expect(result.error.message).toContain("Event with ID 99999 not found");
      }
    });

    it("should remove event and not be retrievable", async () => {
      const createResult = await run(
        createEvent({
          eventDatetime: new Date("2025-01-15T10:00:00Z"),
          description: "Test event",
        }),
      );

      expect(createResult.status).toBe("Success");
      if (createResult.status === "Success") {
        const eventId = createResult.value.id;

        await run(deleteEvent({ id: eventId }));

        // Verify deletion by trying to retrieve
        const getResult = await run(getEventById({ id: eventId }));
        expect(getResult.status).toBe("Failure");
        if (getResult.status === "Failure") {
          expect(getResult.error.code).toBe("NOT_FOUND");
        }
      }
    });

    it("should not affect other events when deleting one", async () => {
      // Create multiple events
      const result1 = await run(
        createEvent({
          eventDatetime: new Date("2025-01-15T10:00:00Z"),
          description: "Event 1",
        }),
      );
      const result2 = await run(
        createEvent({
          eventDatetime: new Date("2025-01-20T14:00:00Z"),
          description: "Event 2",
        }),
      );

      expect(result1.status).toBe("Success");
      expect(result2.status).toBe("Success");

      if (result1.status === "Success" && result2.status === "Success") {
        // Delete first event
        await run(deleteEvent({ id: result1.value.id }));

        // Verify second event still exists
        const getResult = await run(getEventById({ id: result2.value.id }));

        expect(getResult.status).toBe("Success");
        if (getResult.status === "Success") {
          expect(getResult.value.description).toBe("Event 2");
        }

        // Verify only one event remains
        const allResult = await run(getAllEvents());
        expect(allResult.status).toBe("Success");
        if (allResult.status === "Success") {
          expect(allResult.value).toHaveLength(1);
        }
      }
    });
  });

  describe("Event lifecycle workflow", () => {
    it("should support complete event lifecycle", async () => {
      // 1. Create event
      const createResult = await run(
        createEvent({
          eventDatetime: new Date("2025-01-15T10:00:00Z"),
          description: "Initial event",
          status: 1,
        }),
      );

      expect(createResult.status).toBe("Success");
      if (createResult.status !== "Success") return;

      const eventId = createResult.value.id;

      // 2. Retrieve event
      const getResult = await run(getEventById({ id: eventId }));
      expect(getResult.status).toBe("Success");

      // 3. Update event
      const updateResult = await run(
        updateEvent({
          id: eventId,
          updates: {
            description: "Updated event",
            status: 2,
          },
        }),
      );
      expect(updateResult.status).toBe("Success");

      // 4. Verify update
      const getUpdatedResult = await run(getEventById({ id: eventId }));
      expect(getUpdatedResult.status).toBe("Success");
      if (getUpdatedResult.status === "Success") {
        expect(getUpdatedResult.value.description).toBe("Updated event");
        expect(getUpdatedResult.value.status).toBe(2);
      }

      // 5. Delete event
      const deleteResult = await run(deleteEvent({ id: eventId }));
      expect(deleteResult.status).toBe("Success");

      // 6. Verify deletion
      const getFinalResult = await run(getEventById({ id: eventId }));
      expect(getFinalResult.status).toBe("Failure");
    });
  });
});
