import { command, fail, success, type Result } from "#lib/result";
import { milestoneRepository } from "#infrastructure/repositories/drizzle";
import type { MilestoneIdInput, UpdateMilestoneInput } from "../types/inputs";
import type { MilestoneData } from "../types/outputs";
import first from "lodash/fp/first";

/**
 * Update milestone in database
 */
export function updateMilestoneById(
  input: MilestoneIdInput & { updates: UpdateMilestoneInput },
): Result<MilestoneData> {
  return command(
    async () => {
      return await milestoneRepository.update(input.id, input.updates);
    },
    (result) => handleUpdateMilestoneResult(result, input.id),
  );
}

export function handleUpdateMilestoneResult(
  result: MilestoneData[],
  milestoneId: number,
): Result<MilestoneData> {
  const milestones = result;
  const milestone = first(milestones);

  if (!milestone) {
    return fail({
      code: "NOT_FOUND",
      message: `Milestone with ID ${String(milestoneId)} not found`,
      resourceType: "milestone",
      resourceId: milestoneId,
    });
  }

  return success(milestone);
}
