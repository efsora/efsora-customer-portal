import { pipe, type Result } from "#lib/result/index";

import type { LoginInput } from "../types/inputs";
import type { LoginResult } from "../types/outputs";
import {
  validateLoginInput,
  findUserByEmailForLogin,
  verifyLoginPassword,
  addAuthTokenToLogin,
} from "../operations/login";

/**
 * Login workflow
 *
 * Orchestrates the user login process by composing operations using railway-oriented programming.
 *
 * Flow:
 * 1. Validate input (email and password format)
 * 2. Find user by email (return error if not found)
 * 3. Verify password against hash (return error if incorrect)
 * 4. Generate JWT token and return user data + token
 *
 * @param input - LoginInput with email and password
 * @returns Result<LoginResult> with user data and authentication token, or error
 *
 * @example
 * ```typescript
 * const result = await run(login({ email: "user@example.com", password: "pass123" }));
 *
 * if (result.status === "Success") {
 *   const { user, token } = result.value;
 *   console.log(`Login successful for ${user.id}`);
 * } else if (result.status === "Failure") {
 *   if (result.error.code === "USER_INVALID_CREDENTIALS") {
 *     console.log("Invalid email or password");
 *   }
 * }
 * ```
 */
export function login(input: LoginInput): Result<LoginResult> {
  return pipe(
    validateLoginInput(input),
    findUserByEmailForLogin,
    verifyLoginPassword,
    addAuthTokenToLogin,
  );
}
