/**
 * Event Output Types
 */

export type EventData = {
  id: number;
  eventDatetime: Date;
  description: string | null;
  ownerUserId: string | null;
  milestoneId: number | null;
  status: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateEventResult = EventData;
export type UpdateEventResult = EventData;
export type GetEventResult = EventData;
export type GetAllEventsResult = EventData[];
export type DeleteEventResult = {
  id: number;
  message: string;
};
