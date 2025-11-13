/**
 * Milestone Input Types
 */

export type CreateMilestoneInput = {
  projectId?: number | null;
  assigneeUserId?: string | null;
  status?: number | null;
  dueDate?: Date | null;
  description?: string | null;
};

export type UpdateMilestoneInput = {
  projectId?: number | null;
  assigneeUserId?: string | null;
  status?: number | null;
  dueDate?: Date | null;
  description?: string | null;
};

export type MilestoneIdInput = {
  id: number;
};
