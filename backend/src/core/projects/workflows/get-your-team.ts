import { pipe, type Result } from "#lib/result/index";

import type { GetYourTeamInput } from "../types/inputs";
import type { GetYourTeamResult } from "../types/outputs";
import {
  getUserCompanyIdWithInput,
  fetchTeamMembers,
} from "../operations/get-your-team";

/**
 * Get Your Team Workflow
 *
 * Retrieves team members for a project, split into customer team and efsora team.
 *
 * Flow:
 * 1. Get authenticated user's company ID from database
 * 2. Query customer team (users with same projectId and user's companyId)
 * 3. Query efsora team (users with same projectId and companyId = 1)
 * 4. Return both teams (queries run in parallel)
 *
 * @param input - GetYourTeamInput with projectId and userId
 * @returns Result<GetYourTeamResult> with customerTeam and efsoraTeam arrays
 *
 * @example
 * ```typescript
 * const result = await run(getYourTeam({ projectId: 1, userId: "user-uuid" }));
 *
 * if (result.status === "Success") {
 *   const { customerTeam, efsoraTeam } = result.value;
 *   console.log(`Found ${customerTeam.length} customer team members`);
 *   console.log(`Found ${efsoraTeam.length} efsora team members`);
 * }
 * ```
 */
export function getYourTeam(
  input: GetYourTeamInput,
): Result<GetYourTeamResult> {
  return pipe(getUserCompanyIdWithInput(input), fetchTeamMembers);
}
