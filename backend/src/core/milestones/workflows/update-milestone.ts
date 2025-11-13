import { pipe, type Result } from "#lib/result";
import { findMilestoneById } from "../operations/find-milestone";
import { updateMilestoneById } from "../operations/update-milestone";
import type { MilestoneIdInput, UpdateMilestoneInput } from "../types/inputs";
import type { UpdateMilestoneResult } from "../types/outputs";

/**
 * Update Milestone Workflow
 * 1. Verify milestone exists
 * 2. Update milestone
 */
export function updateMilestone(
  input: MilestoneIdInput & { updates: UpdateMilestoneInput },
): Result<UpdateMilestoneResult> {
  return pipe(findMilestoneById({ id: input.id }), () =>
    updateMilestoneById(input),
  );
}
