import {
  createSuccessResponse,
  createFailureResponse,
  type AppResponse,
} from "#lib/types/response";
import { run, matchResponse } from "#lib/result";
import type { ValidatedRequest } from "#middlewares/validate";
import type {
  CreateProjectBody,
  UpdateProjectBody,
  ProjectIdParam,
  GetProjectsQuery,
} from "./schemas";
import {
  createProject,
  getProjectById,
  getAllProjects,
  updateProject,
  deleteProject,
  type CreateProjectResult,
  type ProjectData,
  type DeleteProjectResult,
} from "#core/projects";

/**
 * Handler for POST /api/v1/projects
 * Create a new project
 */
export async function handleCreateProject(
  req: ValidatedRequest<{ body: CreateProjectBody }>,
): Promise<AppResponse<CreateProjectResult>> {
  const body = req.validated.body;

  const result = await run(
    createProject({
      name: body.name,
      companyId: body.companyId,
      status: body.status,
    }),
  );

  return matchResponse(result, {
    onSuccess: (data) => createSuccessResponse(data),
    onFailure: (error) => createFailureResponse(error),
  });
}

/**
 * Handler for GET /api/v1/projects/:id
 * Get a single project by ID
 */
export async function handleGetProjectById(
  req: ValidatedRequest<{ params: ProjectIdParam }>,
): Promise<AppResponse<ProjectData>> {
  const { id } = req.validated.params;

  const result = await run(getProjectById({ id }));

  return matchResponse(result, {
    onSuccess: (data) => createSuccessResponse(data),
    onFailure: (error) => createFailureResponse(error),
  });
}

/**
 * Handler for GET /api/v1/projects
 * Get all projects (optionally filtered by company)
 */
export async function handleGetAllProjects(
  req: ValidatedRequest<{ query: GetProjectsQuery }>,
): Promise<AppResponse<ProjectData[]>> {
  const { companyId } = req.validated.query;

  const result = await run(
    getAllProjects(companyId !== undefined ? { companyId } : undefined),
  );

  return matchResponse(result, {
    onSuccess: (data) => createSuccessResponse(data),
    onFailure: (error) => createFailureResponse(error),
  });
}

/**
 * Handler for PATCH /api/v1/projects/:id
 * Update a project
 */
export async function handleUpdateProject(
  req: ValidatedRequest<{ body: UpdateProjectBody; params: ProjectIdParam }>,
): Promise<AppResponse<ProjectData>> {
  const { id } = req.validated.params;
  const body = req.validated.body;

  const result = await run(
    updateProject({
      id,
      updates: {
        name: body.name,
        status: body.status,
      },
    }),
  );

  return matchResponse(result, {
    onSuccess: (data) => createSuccessResponse(data),
    onFailure: (error) => createFailureResponse(error),
  });
}

/**
 * Handler for DELETE /api/v1/projects/:id
 * Delete a project
 */
export async function handleDeleteProject(
  req: ValidatedRequest<{ params: ProjectIdParam }>,
): Promise<AppResponse<DeleteProjectResult>> {
  const { id } = req.validated.params;

  const result = await run(deleteProject({ id }));

  return matchResponse(result, {
    onSuccess: (data) => createSuccessResponse(data),
    onFailure: (error) => createFailureResponse(error),
  });
}
