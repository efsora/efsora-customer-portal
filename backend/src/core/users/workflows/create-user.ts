import { pipe } from "#lib/result/combinators";
import type { Result } from "#lib/result/index";

import type { CreateUserInput } from "../types/inputs";
import type { CreateUserResult } from "../types/outputs";
import {
  addAuthToken,
  checkEmailAvailability,
  hashPasswordForCreation,
  saveNewUser,
  mapRegisterDataToUser,
  createRegisterSession,
} from "../operations/create-user";

/**
 * Create User Workflow - Session-based authentication
 *
 * Orchestrates the creation of a new user account.
 * This is a public operation that creates users via the /api/v1/users endpoint.
 *
 * Steps:
 * 1. Validate input (email, password format)
 * 2. Check email availability
 * 3. Hash password
 * 4. Save user to database
 * 5. Generate authentication token
 * 6. Create session in database (enables proper logout and token invalidation)
 *
 * @param input - User creation data (email, password, optional name)
 * @returns Result containing user data with authentication token
 */
export function createUser(input: CreateUserInput): Result<CreateUserResult> {
  return pipe(
    mapRegisterDataToUser(input),
    checkEmailAvailability,
    hashPasswordForCreation,
    saveNewUser,
    addAuthToken,
    createRegisterSession,
  );
}
