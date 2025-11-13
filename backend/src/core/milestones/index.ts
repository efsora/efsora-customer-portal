/**
 * Milestones Module
 * Public API for milestone operations
 */

// Workflows
export { createMilestone } from "./workflows/create-milestone";
export { getMilestoneById, getAllMilestones } from "./workflows/get-milestone";
export { updateMilestone } from "./workflows/update-milestone";
export { deleteMilestone } from "./workflows/delete-milestone";

// Public types - Inputs
export type {
  CreateMilestoneInput,
  UpdateMilestoneInput,
  MilestoneIdInput,
} from "./types/inputs";

// Public types - Outputs
export type {
  MilestoneData,
  CreateMilestoneResult,
  UpdateMilestoneResult,
  GetMilestoneResult,
  GetAllMilestonesResult,
  DeleteMilestoneResult,
} from "./types/outputs";

// Public types - Errors
export type {
  MilestoneNotFoundError,
  MilestoneValidationError,
  MilestoneError,
} from "./types/errors";
