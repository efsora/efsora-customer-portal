import { command, fail, success, type Result } from "#lib/result";
import { milestoneRepository } from "#infrastructure/repositories/drizzle";
import type { MilestoneIdInput } from "../types/inputs";
import type { DeleteMilestoneResult } from "../types/outputs";
import { first } from "lodash";

/**
 * Delete milestone from database
 */
export function deleteMilestoneById(
  input: MilestoneIdInput,
): Result<DeleteMilestoneResult> {
  return command(
    async () => {
      return await milestoneRepository.delete(input.id);
    },
    (result) => handleDeleteMilestoneResult(result, input.id),
  );
}

export function handleDeleteMilestoneResult(
  result: unknown,
  milestoneId: number,
): Result<DeleteMilestoneResult> {
  const milestones = result as { id: number }[];
  const milestone = first(milestones);

  if (!milestone) {
    return fail({
      code: "NOT_FOUND",
      message: `Milestone with ID ${String(milestoneId)} not found`,
      resourceType: "milestone",
      resourceId: milestoneId,
    });
  }

  return success({
    id: milestone.id,
    message: "Milestone deleted successfully",
  });
}
