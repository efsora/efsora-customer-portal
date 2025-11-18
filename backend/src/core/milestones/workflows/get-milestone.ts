import { type Result } from "#lib/result";
import {
  findMilestoneById,
  findAllMilestones,
} from "../operations/find-milestone";
import type { MilestoneIdInput } from "../types/inputs";
import type {
  GetMilestoneResult,
  GetAllMilestonesResult,
} from "../types/outputs";

/**
 * Get Milestone By ID Workflow
 */
export function getMilestoneById(
  input: MilestoneIdInput,
): Result<GetMilestoneResult> {
  return findMilestoneById(input);
}

/**
 * Get All Milestones Workflow
 */
export function getAllMilestones(): Result<GetAllMilestonesResult> {
  return findAllMilestones();
}
