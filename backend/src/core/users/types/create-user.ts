/**
 * Types for user creation workflow
 */

import type { Email } from "../value-objects/Email";
import type { Password } from "../value-objects/Password";

/**
 * Input for creating a new user
 */
export interface CreateUserInput {
  email: string;
  name?: string;
  password: string;
}

/**
 * Result after creating a user
 */
export interface CreateUserResult {
  email: string;
  id: number;
  name: null | string;
  token?: string;
}

/**
 * Validated creation data with Value Objects
 */
export interface ValidatedCreationData {
  email: Email;
  name?: string;
  password: Password;
}
