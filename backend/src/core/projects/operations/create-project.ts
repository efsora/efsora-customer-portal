import { command, fail, success, type Result } from "#lib/result";
import {
  projectRepository,
  companyRepository,
} from "#infrastructure/repositories/drizzle";
import type { CreateProjectInput } from "../types/inputs";
import type { CreateProjectResult } from "../types/outputs";
import first from "lodash/fp/first";

/**
 * Check if company exists (required for project creation)
 */
export function checkCompanyExists(
  input: CreateProjectInput,
): Result<CreateProjectInput> {
  return command(async () => {
    const companies = await companyRepository.findById(input.companyId);
    return { companyExists: companies.length > 0, input };
  }, handleCheckCompanyExistsResult);
}

type CheckCompanyExistsCommandResult = {
  companyExists: boolean;
  input: CreateProjectInput;
};

export function handleCheckCompanyExistsResult(
  result: CheckCompanyExistsCommandResult,
): Result<CreateProjectInput> {
  const { companyExists, input } = result;

  if (!companyExists) {
    return fail({
      code: "NOT_FOUND",
      message: `Company with ID ${String(input.companyId)} not found`,
      resourceType: "company",
      resourceId: String(input.companyId),
      context: { operation: "project_operation" },
    });
  }
  return success(input);
}

/**
 * Check if project name already exists within the company
 */
export function checkProjectNameExists(
  input: CreateProjectInput,
): Result<CreateProjectInput> {
  return command(async () => {
    const existingProjects = await projectRepository.findByNameInCompany(
      input.name,
      input.companyId,
    );
    return { duplicate: existingProjects.length > 0, input };
  }, handleCheckProjectNameExistsResult);
}

type CheckProjectNameExistsCommandResult = {
  duplicate: boolean;
  input: CreateProjectInput;
};

export function handleCheckProjectNameExistsResult(
  result: CheckProjectNameExistsCommandResult,
): Result<CreateProjectInput> {
  const { duplicate, input } = result;

  if (duplicate) {
    return fail({
      code: "CONFLICT",
      message: `Project with name "${input.name}" already exists in company ${String(input.companyId)}`,
      conflictType: "project_name",
      projectName: input.name,
      companyId: input.companyId,
    });
  }
  return success(input);
}

/**
 * Save new project to database
 */
export function saveNewProject(
  input: CreateProjectInput,
): Result<CreateProjectResult> {
  return command(async () => {
    return await projectRepository.create({
      name: input.name,
      companyId: input.companyId,
      status: input.status,
    });
  }, handleSaveNewProjectResult);
}

export function handleSaveNewProjectResult(
  result: CreateProjectResult[],
): Result<CreateProjectResult> {
  const projects = result;
  const project = first(projects);

  if (!project) {
    return fail({
      code: "INTERNAL_ERROR",
      message: "Failed to create project",
    });
  }

  return success(project);
}
