import { type Result } from "#lib/result";
import { saveNewMilestone } from "../operations/create-milestone";
import type { CreateMilestoneInput } from "../types/inputs";
import type { CreateMilestoneResult } from "../types/outputs";

/**
 * Create Milestone Workflow
 * Saves a new milestone to the database
 */
export function createMilestone(
  input: CreateMilestoneInput,
): Result<CreateMilestoneResult> {
  return saveNewMilestone(input);
}
