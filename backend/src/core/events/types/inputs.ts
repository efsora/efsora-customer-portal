/**
 * Event Input Types
 */

export type CreateEventInput = {
  title: string;
  eventDatetime: Date;
  description?: string | null;
  ownerUserId?: string | null;
  milestoneId?: number | null;
  status?: number | null;
};

export type UpdateEventInput = {
  title?: string;
  eventDatetime?: Date;
  description?: string | null;
  ownerUserId?: string | null;
  milestoneId?: number | null;
  status?: number | null;
};

export type EventIdInput = {
  id: number;
};
