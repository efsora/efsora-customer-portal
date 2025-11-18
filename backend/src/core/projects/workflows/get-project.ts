import type { Result } from "#lib/result";
import { findProjectById, findAllProjects } from "../operations/find-project";
import type {
  ProjectIdInput,
  FindProjectsByCompanyInput,
} from "../types/inputs";
import type { ProjectData } from "../types/outputs";

/**
 * Get Project by ID Workflow
 */
export function getProjectById(input: ProjectIdInput): Result<ProjectData> {
  return findProjectById(input);
}

/**
 * Get All Projects Workflow
 * Optionally filter by company
 */
export function getAllProjects(
  input?: FindProjectsByCompanyInput,
): Result<ProjectData[]> {
  return findAllProjects(input);
}
