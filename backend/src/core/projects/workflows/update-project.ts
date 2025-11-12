import type { Result } from "#lib/result";
import { updateProjectById } from "../operations/update-project";
import type { ProjectIdInput, UpdateProjectInput } from "../types/inputs";
import type { ProjectData } from "../types/outputs";

/**
 * Update Project Workflow
 */
export function updateProject(
  input: ProjectIdInput & { updates: UpdateProjectInput },
): Result<ProjectData> {
  return updateProjectById(input);
}
