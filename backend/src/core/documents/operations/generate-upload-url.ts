import { command, fail, success, type Result } from "#lib/result";
import {
  projectRepository,
  userRepository,
} from "#infrastructure/repositories/drizzle";
import {
  generatePresignedUploadUrl,
  buildDocumentKey,
} from "#infrastructure/s3";
import type { GenerateUploadUrlInput } from "../types/inputs";
import type { GenerateUploadUrlResult } from "../types/outputs";
import first from "lodash/fp/first";

/**
 * Validate that the project exists
 */
export function validateProject(
  input: GenerateUploadUrlInput,
): Result<GenerateUploadUrlInput & { companyId: number }> {
  return command(async () => {
    const projects = await projectRepository.findById(input.projectId);
    const project = first(projects);
    return { project, input };
  }, handleValidateProjectResult);
}

type ValidateProjectCommandResult = {
  project: { id: number; companyId: number | null } | undefined;
  input: GenerateUploadUrlInput;
};

export function handleValidateProjectResult(
  result: ValidateProjectCommandResult,
): Result<GenerateUploadUrlInput & { companyId: number }> {
  const { project, input } = result;

  if (!project) {
    return fail({
      code: "DOCUMENT_PROJECT_NOT_FOUND",
      message: `Project with ID ${String(input.projectId)} not found`,
    });
  }

  if (!project.companyId) {
    return fail({
      code: "DOCUMENT_PROJECT_NO_COMPANY",
      message: `Project ${String(input.projectId)} has no associated company`,
    });
  }

  return success({ ...input, companyId: project.companyId });
}

/**
 * Validate that the user has access to the project
 * User must be assigned to the specific project
 */
export function validateUserAccess(
  input: GenerateUploadUrlInput & { companyId: number },
): Result<GenerateUploadUrlInput & { companyId: number }> {
  return command(async () => {
    const users = await userRepository.findById(input.userId);
    const user = first(users);
    return { user, input };
  }, handleValidateUserAccessResult);
}

type ValidateUserAccessCommandResult = {
  user:
    | {
        id: string;
        companyId: number | null;
        projectId: number | null;
      }
    | undefined;
  input: GenerateUploadUrlInput & { companyId: number };
};

export function handleValidateUserAccessResult(
  result: ValidateUserAccessCommandResult,
): Result<GenerateUploadUrlInput & { companyId: number }> {
  const { user, input } = result;

  if (!user) {
    return fail({
      code: "DOCUMENT_USER_NOT_FOUND",
      message: `User with ID ${input.userId} not found`,
    });
  }

  // Check if user belongs to the same company as the project
  if (user.companyId !== input.companyId) {
    return fail({
      code: "DOCUMENT_UNAUTHORIZED_PROJECT_ACCESS",
      message: `User ${input.userId} does not belong to the same company as project ${String(input.projectId)}`,
    });
  }

  // Check if user is assigned to the specific project
  if (user.projectId !== input.projectId) {
    return fail({
      code: "DOCUMENT_UNAUTHORIZED_PROJECT_ACCESS",
      message: `User ${input.userId} is not assigned to project ${String(input.projectId)}`,
    });
  }

  return success(input);
}

/**
 * Generate S3 pre-signed upload URL
 */
export function generateS3UploadUrl(
  input: GenerateUploadUrlInput & { companyId: number },
): Result<GenerateUploadUrlResult> {
  return command(async () => {
    const key = buildDocumentKey(
      input.companyId,
      input.projectId,
      input.fileName,
    );

    const result = await generatePresignedUploadUrl({
      key,
      contentType: input.fileType,
      expiresIn: 900, // 15 minutes
      metadata: {
        category: input.category,
      },
    });

    return result;
  }, handleGenerateS3UploadUrlResult);
}

type GenerateS3UploadUrlCommandResult = {
  url: string;
  key: string;
  expiresIn: number;
};

export function handleGenerateS3UploadUrlResult(
  result: GenerateS3UploadUrlCommandResult,
): Result<GenerateUploadUrlResult> {
  const s3Result = result;

  if (!s3Result.url) {
    return fail({
      code: "DOCUMENT_S3_URL_GENERATION_FAILED",
      message: "Failed to generate S3 pre-signed upload URL",
    });
  }

  return success({
    uploadUrl: s3Result.url,
    s3Key: s3Result.key,
    expiresIn: s3Result.expiresIn,
  });
}
