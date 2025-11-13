import { command, fail, success, type Result } from "#lib/result";
import { projectRepository } from "#infrastructure/repositories/drizzle";
import type { ProjectIdInput, UpdateProjectInput } from "../types/inputs";
import type { ProjectData } from "../types/outputs";
import first from "lodash/fp/first";

/**
 * Update project in database
 */
export function updateProjectById(
  input: ProjectIdInput & { updates: UpdateProjectInput },
): Result<ProjectData> {
  return command(async () => {
    const projects = await projectRepository.update(input.id, input.updates);
    return { projects, projectId: input.id };
  }, handleUpdateProjectResult);
}

export function handleUpdateProjectResult(
  result: unknown,
): Result<ProjectData> {
  const { projects, projectId } = result as {
    projects: ProjectData[];
    projectId: number;
  };
  const project = first(projects);

  if (!project) {
    return fail({
      code: "NOT_FOUND",
      message: `Project with ID ${String(projectId)} not found`,
      resourceType: "project",
      resourceId: String(projectId),
    });
  }

  return success(project);
}
