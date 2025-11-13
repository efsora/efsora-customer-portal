/**
 * Event Input Types
 */

export type CreateEventInput = {
  eventDatetime: Date;
  description?: string | null;
  ownerUserId?: string | null;
  milestoneId?: number | null;
  status?: number | null;
};

export type UpdateEventInput = {
  eventDatetime?: Date;
  description?: string | null;
  ownerUserId?: string | null;
  milestoneId?: number | null;
  status?: number | null;
};

export type EventIdInput = {
  id: number;
};
