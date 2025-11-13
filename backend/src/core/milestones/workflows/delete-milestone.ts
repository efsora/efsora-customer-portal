import { pipe, type Result } from "#lib/result";
import { findMilestoneById } from "../operations/find-milestone";
import { deleteMilestoneById } from "../operations/delete-milestone";
import type { MilestoneIdInput } from "../types/inputs";
import type { DeleteMilestoneResult } from "../types/outputs";

/**
 * Delete Milestone Workflow
 * 1. Verify milestone exists
 * 2. Delete milestone
 */
export function deleteMilestone(
  input: MilestoneIdInput,
): Result<DeleteMilestoneResult> {
  return pipe(findMilestoneById(input), () => deleteMilestoneById(input));
}
