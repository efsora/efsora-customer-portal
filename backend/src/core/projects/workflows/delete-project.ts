import type { Result } from "#lib/result";
import { deleteProjectById } from "../operations/delete-project";
import type { ProjectIdInput } from "../types/inputs";
import type { DeleteProjectResult } from "../types/outputs";

/**
 * Delete Project Workflow
 */
export function deleteProject(
  input: ProjectIdInput,
): Result<DeleteProjectResult> {
  return deleteProjectById(input);
}
