import { command, fail, success, type Result } from "#lib/result";
import { projectRepository } from "#infrastructure/repositories/drizzle";
import type { ProjectIdInput } from "../types/inputs";
import type { DeleteProjectResult } from "../types/outputs";
import { first } from "lodash";

/**
 * Delete project from database
 */
export function deleteProjectById(
  input: ProjectIdInput,
): Result<DeleteProjectResult> {
  return command(async () => {
    const projects = await projectRepository.delete(input.id);
    return { projects, projectId: input.id };
  }, handleDeleteProjectResult);
}

export function handleDeleteProjectResult(
  result: unknown,
): Result<DeleteProjectResult> {
  const { projects, projectId } = result as {
    projects: { id: number }[];
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

  return success({
    id: project.id,
    message: "Project deleted successfully",
  });
}
