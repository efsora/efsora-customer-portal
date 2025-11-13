/**
 * Milestone Output Types
 */

export type MilestoneData = {
  id: number;
  title: string;
  projectId: number | null;
  assigneeUserId: string | null;
  status: number | null;
  dueDate: Date | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateMilestoneResult = MilestoneData;
export type UpdateMilestoneResult = MilestoneData;
export type GetMilestoneResult = MilestoneData;
export type GetAllMilestonesResult = MilestoneData[];
export type DeleteMilestoneResult = {
  id: number;
  message: string;
};
