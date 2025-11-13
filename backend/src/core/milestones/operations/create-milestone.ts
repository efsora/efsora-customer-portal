import { command, fail, success, type Result } from "#lib/result";
import { milestoneRepository } from "#infrastructure/repositories/drizzle";
import type { CreateMilestoneInput } from "../types/inputs";
import type { MilestoneData } from "../types/outputs";
import first from "lodash/fp/first";

/**
 * Save new milestone to database
 */
export function saveNewMilestone(
  input: CreateMilestoneInput,
): Result<MilestoneData> {
  return command(async () => {
    return await milestoneRepository.create({
      title: input.title,
      projectId: input.projectId ?? null,
      assigneeUserId: input.assigneeUserId ?? null,
      status: input.status ?? null,
      dueDate: input.dueDate ?? null,
      description: input.description ?? null,
    });
  }, handleSaveNewMilestoneResult);
}

export function handleSaveNewMilestoneResult(
  result: unknown,
): Result<MilestoneData> {
  const milestones = result as MilestoneData[];
  const milestone = first(milestones);

  if (!milestone) {
    return fail({
      code: "INTERNAL_ERROR",
      message: "Failed to create milestone",
    });
  }

  return success({
    id: milestone.id,
    title: milestone.title,
    projectId: milestone.projectId,
    assigneeUserId: milestone.assigneeUserId,
    status: milestone.status,
    dueDate: milestone.dueDate,
    description: milestone.description,
    createdAt: milestone.createdAt,
    updatedAt: milestone.updatedAt,
  });
}
