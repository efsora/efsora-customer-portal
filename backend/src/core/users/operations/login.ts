import type { User } from "#db/schema";
import { SESSION_EXPIRES_IN_MS } from "#infrastructure/auth/constants";
import { generateAuthToken } from "#infrastructure/auth/token";
import { sessionRepository } from "#infrastructure/repositories/drizzle";
import { command, fail, pipe, success, type Result } from "#lib/result/index";
import bcrypt from "bcrypt";

import { mapUserToUserData } from "../mappers";
import type { LoginInput } from "../types/inputs";
import type { LoginResult } from "../types/outputs";
import { Email } from "../value-objects/Email";
import { findByEmail } from "./find";

/**
 * Step 1: Map and validate login input
 *
 * Converts raw input string to Email value object (validates ONCE).
 * This replaces the redundant validateLoginInput that was discarding the Email.
 *
 * @param input - Raw login input from HTTP request (already validated by Zod)
 * @returns Result with Email value object and password
 */
export function mapLoginInput(input: LoginInput): Result<{
  email: Email;
  password: string;
}> {
  return pipe(Email.create(input.email), (email) =>
    success({ email, password: input.password }),
  );
}

/**
 * Step 2: Find user by email
 *
 * Uses Email value object from step 1 (no re-validation needed).
 * Returns the full User entity (including password hash) for authentication.
 *
 * @param data - Contains validated Email and plain password
 * @returns Result with password and user if found, or failure with generic error
 */
export function findUserByEmailForLogin(data: {
  email: Email;
  password: string;
}): Result<{ password: string; user: User }> {
  return pipe(findByEmail(data.email), (user) => {
    if (!user) {
      return fail({
        code: "USER_INVALID_CREDENTIALS",
        message: "Invalid email or password",
      });
    }
    return success({ password: data.password, user });
  });
}

/**
 * Step 3: Verify password
 *
 * Direct bcrypt comparison without unnecessary HashedPassword value object wrapper.
 * Uses command for observability (logging, metrics, tracing) since bcrypt is async.
 *
 * Security notes:
 * - bcrypt.compare is timing-safe (constant-time comparison)
 * - Generic error message prevents user enumeration
 * - Password from DB is already a valid bcrypt hash (no validation needed)
 *
 * @param data - Contains plain password and user with hashed password
 * @returns Result with user if password matches, or failure with generic error
 */
export function verifyLoginPassword(data: {
  password: string;
  user: User;
}): Result<User> {
  return command(
    async () => {
      return await bcrypt.compare(data.password, data.user.password);
    },
    (isValid: boolean) =>
      isValid
        ? success(data.user)
        : fail({
            code: "USER_INVALID_CREDENTIALS",
            message: "Invalid email or password",
          }),
  );
}

/**
 * Step 4: Generate JWT token
 *
 * Synchronous operation (no async overhead needed).
 * JWT generation is a pure function (userId + email → token string).
 * No observability needed - it's not a side effect that can fail.
 *
 * @param user - Authenticated user entity
 * @returns Result with login result containing user data and JWT token
 */
export function addAuthTokenToLogin(user: User): Result<LoginResult> {
  const token = generateAuthToken(user.id, user.email);
  return success({
    user: mapUserToUserData(user),
    token,
  });
}

/**
 * Step 5: Create session in database
 *
 * Stores the authentication session for stateful token management.
 * This enables proper logout functionality and session invalidation.
 *
 * @param loginResult - Login result with user data and token
 * @returns Result with the same login result, or failure if session creation fails
 */
export function createLoginSession(
  loginResult: LoginResult,
): Result<LoginResult> {
  return command(
    async () => {
      const expiresAt = new Date(Date.now() + SESSION_EXPIRES_IN_MS);

      const sessions = await sessionRepository.create({
        userId: loginResult.user.id,
        token: loginResult.token,
        expiresAt,
      });

      return sessions[0];
    },
    () => {
      return success(loginResult);
    },
  );
}
