import { pipe, type Result } from "#lib/result";
import {
  checkCompanyExists,
  checkProjectNameExists,
  saveNewProject,
} from "../operations/create-project";
import type { CreateProjectInput } from "../types/inputs";
import type { CreateProjectResult } from "../types/outputs";

/**
 * Create Project Workflow
 * 1. Check if company exists
 * 2. Check if project name already exists within company
 * 3. Save new project
 */
export function createProject(
  input: CreateProjectInput,
): Result<CreateProjectResult> {
  return pipe(
    checkCompanyExists(input),
    checkProjectNameExists,
    saveNewProject,
  );
}
