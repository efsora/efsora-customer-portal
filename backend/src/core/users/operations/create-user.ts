import type { NewUser, User } from "#db/schema";
import { SESSION_EXPIRES_IN_MS } from "#infrastructure/auth/constants";
import { generateAuthToken } from "#infrastructure/auth/token";
import {
  sessionRepository,
  userRepository,
} from "#infrastructure/repositories/drizzle";
import { allNamed, chain } from "#lib/result/combinators";
import { command, fail, success, type Result } from "#lib/result/index";
import first from "lodash/fp/first";

import type { CreateUserInput } from "../types/inputs";
import type { ValidatedCreationData } from "../types/internal";
import type { CreateUserResult } from "../types/outputs";
import { Email } from "../value-objects/Email";
import { HashedPassword, Password } from "../value-objects/Password";
import { mapUserToUserData } from "../mappers";
import { findByEmail } from "./find";

/**
 * Maps raw registration input to domain Value Objects
 * Transforms primitive strings into type-safe Email and Password branded types
 */
export function mapRegisterDataToUser(
  input: CreateUserInput,
): Result<ValidatedCreationData> {
  return chain(
    allNamed({
      email: Email.create(input.email),
      password: Password.create(input.password),
    }),
    (result) =>
      success({
        email: result.email,
        name: input.name,
        password: result.password,
      }),
  );
}

/**
 * Checks if email is already registered
 */
export function checkEmailAvailability(
  data: ValidatedCreationData,
): Result<ValidatedCreationData> {
  return chain(findByEmail(data.email), (existingUser) => {
    if (existingUser) {
      return fail({
        code: "USER_EMAIL_ALREADY_EXISTS",
        message: "Email already in use",
      });
    }
    return success(data);
  });
}

/**
 * Hashes password using Password Value Object
 */
export function hashPasswordForCreation(data: ValidatedCreationData): Result<{
  email: Email;
  hashedPassword: HashedPassword;
  name?: string;
}> {
  return chain(Password.hash(data.password), (hashedPassword) =>
    success({
      email: data.email,
      hashedPassword,
      name: data.name,
    }),
  );
}

/**
 * Continuation function for saveNewUser operation.
 * Handles the result of user creation in the database.
 *
 * @param user - User returned from database or undefined if creation failed
 * @returns Result with full user entity (with timestamps) on success, or Failure on error
 *
 * @example
 * ```ts
 * // Unit test - success case
 * const mockUser = { id: 'uuid-123', email: 'test@example.com', name: 'Test User', createdAt: new Date(), updatedAt: new Date() };
 * const result = handleSaveNewUserResult(mockUser);
 * expect(result.status).toBe('Success');
 *
 * // Unit test - failure case
 * const result = handleSaveNewUserResult(undefined);
 * expect(result.status).toBe('Failure');
 * expect(result.error.code).toBe('INTERNAL_ERROR');
 * ```
 */
export function handleSaveNewUserResult(
  user:
    | {
        id: string;
        email: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
      }
    | undefined,
) {
  if (!user) {
    return fail({
      code: "INTERNAL_ERROR",
      message: "Failed to create user",
    });
  }

  // Return full user entity (token will be added in next step)
  return success(user);
}

export function saveNewUser(data: {
  email: Email;
  hashedPassword: HashedPassword;
  name?: string;
}): Result<User> {
  return command(async () => {
    const userData: NewUser = {
      email: Email.toString(data.email),
      name: data.name ?? null,
      password: HashedPassword.toString(data.hashedPassword),
    };

    const users = await userRepository.create(userData);
    return first(users);
  }, handleSaveNewUserResult);
}

/**
 * Adds authentication token to user result
 * Generates JWT token for the newly created user and wraps in proper structure
 * Uses mapUserToUserData to ensure consistency with login flow
 *
 * @param user - Full user entity from database (with timestamps)
 * @returns Result with nested structure: { user: {...}, token: "..." }
 */
export function addAuthToken(user: User): Result<CreateUserResult> {
  const token = generateAuthToken(user.id, user.email);
  return success({
    user: mapUserToUserData(user),
    token,
  });
}

/**
 * Create session in database for newly registered user
 *
 * Stores the authentication session for stateful token management.
 * This enables proper logout functionality and session invalidation.
 *
 * @param createUserResult - Create user result with user data and token
 * @returns Result with the same create user result, or failure if session creation fails
 */
export function createRegisterSession(
  createUserResult: CreateUserResult,
): Result<CreateUserResult> {
  return command(
    async () => {
      const expiresAt = new Date(Date.now() + SESSION_EXPIRES_IN_MS);

      const sessions = await sessionRepository.create({
        userId: createUserResult.user.id,
        token: createUserResult.token,
        expiresAt,
      });

      return sessions[0];
    },
    () => {
      return success(createUserResult);
    },
  );
}
