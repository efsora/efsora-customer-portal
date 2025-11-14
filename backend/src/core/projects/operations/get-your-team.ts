import { command, fail, success, type Result } from "#lib/result";
import { userRepository } from "#infrastructure/repositories/drizzle";
import type { ExtendedUserData } from "#core/users";
import type { GetYourTeamInput } from "../types/inputs";
import type { GetYourTeamResult } from "../types/outputs";
import first from "lodash/fp/first";

const EFSORA_COMPANY_ID = 1;

/**
 * Step 1: Get user's company ID and combine with input
 */
export function getUserCompanyIdWithInput(
  input: GetYourTeamInput,
): Result<{ projectId: number; userCompanyId: number }> {
  return command(async () => {
    const users = await userRepository.findById(input.userId);
    return {
      user: first(users),
      userId: input.userId,
      projectId: input.projectId,
    };
  }, handleGetUserCompanyIdResult);
}

export function handleGetUserCompanyIdResult(result: unknown): Result<{
  projectId: number;
  userCompanyId: number;
}> {
  const { user, userId, projectId } = result as {
    user: { companyId: number | null } | undefined;
    userId: string;
    projectId: number;
  };

  if (!user) {
    return fail({
      code: "NOT_FOUND",
      message: `User with ID ${userId} not found`,
      resourceType: "user",
      resourceId: userId,
    });
  }

  if (user.companyId === null) {
    return fail({
      code: "VALIDATION_ERROR",
      message: `User ${userId} does not belong to any company`,
    });
  }

  return success({ projectId, userCompanyId: user.companyId });
}

/**
 * Step 2: Get both customer and efsora teams for a project
 */
export function fetchTeamMembers(data: {
  projectId: number;
  userCompanyId: number;
}): Result<GetYourTeamResult> {
  return command(async () => {
    // Run both queries in parallel
    const [customerTeam, efsoraTeam] = await Promise.all([
      userRepository.findByProjectAndCompany(
        data.projectId,
        data.userCompanyId,
      ),
      userRepository.findByProjectAndCompany(data.projectId, EFSORA_COMPANY_ID),
    ]);

    return { customerTeam, efsoraTeam };
  }, handleFetchTeamMembersResult);
}

export function handleFetchTeamMembersResult(
  result: unknown,
): Result<GetYourTeamResult> {
  const { customerTeam, efsoraTeam } = result as {
    customerTeam: ExtendedUserData[];
    efsoraTeam: ExtendedUserData[];
  };

  return success({
    customerTeam,
    efsoraTeam,
  });
}
