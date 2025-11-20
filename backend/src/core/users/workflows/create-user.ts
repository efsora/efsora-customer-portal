import { pipe } from "#lib/result/combinators";
import type { Result } from "#lib/result/index";

import {
  addAuthToken,
  checkEmailAvailability,
  createRegisterSession,
  hashPasswordForCreation,
  mapRegisterDataToUser,
  markInvitationAsAccepted,
  saveNewUser,
  validateInvitation,
} from "../operations/create-user";
import type { CreateUserInput } from "../types/inputs";
import type { CreateUserResult } from "../types/outputs";

/**
 * Create User Workflow - Invitation-only registration with session-based authentication
 *
 * Orchestrates the creation of a new user account.
 * This is a public operation that creates users via the /api/v1/auth/register endpoint.
 *
 * Steps:
 * 1. Validate input (email, password format)
 * 2. Validate invitation (must exist, be PENDING, and not expired)
 * 3. Check email availability
 * 4. Hash password
 * 5. Save user to database
 * 6. Generate authentication token
 * 7. Create session in database (enables proper logout and token invalidation)
 * 8. Mark invitation as ACCEPTED
 *
 * @param input - User creation data (email, password, optional name)
 * @returns Result containing user data with authentication token
 */
export function createUser(input: CreateUserInput): Result<CreateUserResult> {
  // First pipeline: validation and user creation
  const userCreationResult = pipe(
    mapRegisterDataToUser(input),
    validateInvitation,
    checkEmailAvailability,
    hashPasswordForCreation,
    saveNewUser,
    addAuthToken,
  );

  // Second pipeline: session management and invitation finalization
  return pipe(
    userCreationResult,
    createRegisterSession,
    markInvitationAsAccepted,
  );
}
