import { pipe, type Result } from "#lib/result/index";

import type { LoginInput } from "../types/inputs";
import type { LoginResult } from "../types/outputs";
import {
  mapLoginInput,
  findUserByEmailForLogin,
  verifyLoginPassword,
  addAuthTokenToLogin,
} from "../operations/login";

/**
 * Login workflow - Simplified and efficient
 *
 * Orchestrates the user login process by composing operations using railway-oriented programming.
 * Optimized to avoid redundant validations and unnecessary async wrappers.
 *
 * Flow:
 * 1. Map input to Email value object (single validation)
 * 2. Find user by email (using Email directly, no re-validation)
 * 3. Verify password with bcrypt (direct comparison, no value object wrapper)
 * 4. Generate JWT token (synchronous, no fake async)
 *
 * Performance improvements:
 * - Email validation happens only once (not twice)
 * - No unnecessary HashedPassword wrapper for DB hash
 * - No fake async wrapping of synchronous JWT generation
 *
 * Security maintained:
 * - Generic error messages prevent user enumeration
 * - Timing-safe bcrypt comparison
 * - All passwords auto-sanitized in logs
 *
 * @param input - LoginInput with email and password (pre-validated by Zod schema)
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
    mapLoginInput(input),
    findUserByEmailForLogin,
    verifyLoginPassword,
    addAuthTokenToLogin,
  );
}
