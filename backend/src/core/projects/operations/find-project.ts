import { command, fail, success, type Result } from "#lib/result";
import { projectRepository } from "#infrastructure/repositories/drizzle";
import type {
  ProjectIdInput,
  FindProjectsByCompanyInput,
} from "../types/inputs";
import type { ProjectData } from "../types/outputs";
import { first } from "lodash";

/**
 * Find project by ID
 */
export function findProjectById(input: ProjectIdInput): Result<ProjectData> {
  return command(
    async () => {
      const projects = await projectRepository.findById(input.id);
      return { projects, projectId: input.id };
    },
    handleFindProjectByIdResult,
    {
      operation: "findProjectById",
      tags: { domain: "projects", action: "read" },
    },
  );
}

export function handleFindProjectByIdResult(
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

/**
 * Find all projects (optionally filtered by company)
 */
export function findAllProjects(
  input?: FindProjectsByCompanyInput,
): Result<ProjectData[]> {
  return command(
    async () => {
      return await projectRepository.findAll(input?.companyId);
    },
    handleFindAllProjectsResult,
    {
      operation: "findAllProjects",
      tags: { domain: "projects", action: "read" },
    },
  );
}

export function handleFindAllProjectsResult(
  result: unknown,
): Result<ProjectData[]> {
  const projects = result as ProjectData[];
  return success(projects);
}
