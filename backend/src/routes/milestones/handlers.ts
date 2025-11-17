import {
  createSuccessResponse,
  createFailureResponse,
  type AppResponse,
} from "#lib/types/response";
import { run, matchResponse } from "#lib/result";
import type { ValidatedRequest } from "#middlewares/validate";
import {
  createMilestone,
  getMilestoneById,
  getAllMilestones,
  updateMilestone,
  deleteMilestone,
} from "#core/milestones";
import type {
  CreateMilestoneResult,
  GetMilestoneResult,
  GetAllMilestonesResult,
  UpdateMilestoneResult,
  DeleteMilestoneResult,
} from "#core/milestones";
import type {
  CreateMilestoneBody,
  UpdateMilestoneBody,
  MilestoneIdParam,
} from "./schemas";

/**
 * POST /api/v1/milestones
 * Create a new milestone
 */
export async function handleCreateMilestone(
  req: ValidatedRequest<{ body: CreateMilestoneBody }>,
): Promise<AppResponse<CreateMilestoneResult>> {
  const body = req.validated.body;

  const result = await run(
    createMilestone({
      title: body.title,
      projectId: body.projectId,
      assigneeUserId: body.assigneeUserId,
      status: body.status,
      dueDate: body.dueDate,
      description: body.description,
    }),
  );

  return matchResponse(result, {
    onSuccess: (data) => createSuccessResponse(data),
    onFailure: (error) => createFailureResponse(error),
  });
}

/**
 * GET /api/v1/milestones/:id
 * Get milestone by ID
 */
export async function handleGetMilestoneById(
  req: ValidatedRequest<{ params: MilestoneIdParam }>,
): Promise<AppResponse<GetMilestoneResult>> {
  const { id } = req.validated.params;

  const result = await run(getMilestoneById({ id }));

  return matchResponse(result, {
    onSuccess: (data) => createSuccessResponse(data),
    onFailure: (error) => createFailureResponse(error),
  });
}

/**
 * GET /api/v1/milestones
 * Get all milestones
 */
export async function handleGetAllMilestones(): Promise<
  AppResponse<GetAllMilestonesResult>
> {
  const result = await run(getAllMilestones());

  return matchResponse(result, {
    onSuccess: (data) => createSuccessResponse(data),
    onFailure: (error) => createFailureResponse(error),
  });
}

/**
 * PUT /api/v1/milestones/:id
 * Update milestone
 */
export async function handleUpdateMilestone(
  req: ValidatedRequest<{
    params: MilestoneIdParam;
    body: UpdateMilestoneBody;
  }>,
): Promise<AppResponse<UpdateMilestoneResult>> {
  const { id } = req.validated.params;
  const body = req.validated.body;

  const result = await run(
    updateMilestone({
      id,
      updates: body,
    }),
  );

  return matchResponse(result, {
    onSuccess: (data) => createSuccessResponse(data),
    onFailure: (error) => createFailureResponse(error),
  });
}

/**
 * DELETE /api/v1/milestones/:id
 * Delete milestone
 */
export async function handleDeleteMilestone(
  req: ValidatedRequest<{ params: MilestoneIdParam }>,
): Promise<AppResponse<DeleteMilestoneResult>> {
  const { id } = req.validated.params;

  const result = await run(deleteMilestone({ id }));

  return matchResponse(result, {
    onSuccess: (data) => createSuccessResponse(data),
    onFailure: (error) => createFailureResponse(error),
  });
}
