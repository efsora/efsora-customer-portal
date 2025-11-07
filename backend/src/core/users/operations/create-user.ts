import type { NewUser } from "#db/schema";
import { userRepository } from "#infrastructure/repositories/drizzle";
import { command, type Result, fail, success } from "#lib/result/index";
import { allNamed, chain } from "#lib/result/combinators";
import { generateAuthToken } from "#infrastructure/auth/token";
import first from "lodash/fp/first";

import type { CreateUserInput } from "../types/inputs";
import type { CreateUserResult } from "../types/outputs";
import type { ValidatedCreationData } from "../types/internal";
import { Email } from "../value-objects/Email";
import { HashedPassword, Password } from "../value-objects/Password";
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
 * @returns Result with user data (without token yet) on success, or Failure on error
 *
 * @example
 * ```ts
 * // Unit test - success case
 * const mockUser = { id: 'uuid-123', email: 'test@example.com', name: 'Test User' };
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
  user: { id: string; email: string; name: string | null } | undefined,
) {
  if (!user) {
    return fail({
      code: "INTERNAL_ERROR",
      message: "Failed to create user",
    });
  }

  // Return user data structure (token will be added in next step)
  return success({
    email: user.email,
    id: user.id,
    name: user.name,
  });
}

export function saveNewUser(data: {
  email: Email;
  hashedPassword: HashedPassword;
  name?: string;
}): Result<{ email: string; id: string; name: string | null }> {
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
 *
 * @param userData - User data from database (id, email, name)
 * @returns Result with nested structure: { user: {...}, token: "..." }
 */
export function addAuthToken(userData: {
  email: string;
  id: string;
  name: string | null;
}): Result<CreateUserResult> {
  const token = generateAuthToken(userData.id, userData.email);
  return success({
    user: {
      id: userData.id,
      email: userData.email,
      name: userData.name,
    },
    token,
  });
}
