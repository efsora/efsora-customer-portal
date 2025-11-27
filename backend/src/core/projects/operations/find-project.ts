import { command, fail, success, type Result } from "#lib/result";
import { projectRepository } from "#infrastructure/repositories/drizzle";
import type {
  ProjectIdInput,
  FindProjectsByCompanyInput,
} from "../types/inputs";
import type { ProjectData } from "../types/outputs";
import first from "lodash/fp/first";

/**
 * Find project by ID
 */
export function findProjectById(input: ProjectIdInput): Result<ProjectData> {
  return command(async () => {
    const projects = await projectRepository.findById(input.id);
    return { projects, projectId: input.id };
  }, handleFindProjectByIdResult);
}

type FindProjectByIdCommandResult = {
  projects: ProjectData[];
  projectId: number;
};

export function handleFindProjectByIdResult(
  result: FindProjectByIdCommandResult,
): Result<ProjectData> {
  const { projects, projectId } = result;
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

/**
 * Find all projects (optionally filtered by company)
 */
export function findAllProjects(
  input?: FindProjectsByCompanyInput,
): Result<ProjectData[]> {
  return command(async () => {
    return await projectRepository.findAll(input?.companyId);
  }, handleFindAllProjectsResult);
}

export function handleFindAllProjectsResult(
  result: ProjectData[],
): Result<ProjectData[]> {
  const projects = result;
  return success(projects);
}
