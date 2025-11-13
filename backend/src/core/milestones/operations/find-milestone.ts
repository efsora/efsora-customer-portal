import { command, fail, success, type Result } from "#lib/result";
import { milestoneRepository } from "#infrastructure/repositories/drizzle";
import type { MilestoneIdInput } from "../types/inputs";
import type { MilestoneData } from "../types/outputs";
import first from "lodash/fp/first";

/**
 * Find milestone by ID
 */
export function findMilestoneById(
  input: MilestoneIdInput,
): Result<MilestoneData> {
  return command(
    async () => {
      return await milestoneRepository.findById(input.id);
    },
    (result) => handleFindMilestoneByIdResult(result, input.id),
  );
}

export function handleFindMilestoneByIdResult(
  result: unknown,
  milestoneId: number,
): Result<MilestoneData> {
  const milestones = result as MilestoneData[];
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

/**
 * Find all milestones
 */
export function findAllMilestones(): Result<MilestoneData[]> {
  return command(async () => {
    return await milestoneRepository.findAll();
  }, handleFindAllMilestonesResult);
}

export function handleFindAllMilestonesResult(
  result: unknown,
): Result<MilestoneData[]> {
  const milestones = result as MilestoneData[];
  return success(milestones);
}
