/**
 * User Domain Error Types
 *
 * Defines all error types specific to the users domain.
 * Each error has a domain-specific code that encodes both the domain and error type.
 */

import type { ErrorBase } from "#lib/result/types/errors";

/**
 * Union of all user domain errors.
 * Use this type when handling user-specific errors.
 */
export type UserError =
  | UserEmailAlreadyExistsError
  | UserForbiddenError
  | UserInvalidEmailError
  | UserInvalidPasswordError
  | UserNotFoundError
  | UserInvalidCredentialsError
  | UserCompanyNotFoundError
  | UserProjectNotFoundError
  | UserRoleNotFoundError
  | UserCurrentPasswordInvalidError
  | UserInvitationNotFoundError
  | UserInvitationExpiredError
  | UserInvitationCancelledError
  | UserInvitationAlreadyExistsError;

/**
 * User not found error - requested user doesn't exist.
 * Used when querying for a user that doesn't exist in the database.
 *
 * @example
 * ```typescript
 * fail({
 *   code: "USER_NOT_FOUND",
 *   message: "User not found"
 * })
 * ```
 */
export type UserNotFoundError = ErrorBase & {
  code: "USER_NOT_FOUND";
};

/**
 * User forbidden error - cannot access/modify another user's data.
 * Used when attempting to update or delete another user's profile.
 *
 * @example
 * ```typescript
 * fail({
 *   code: "USER_FORBIDDEN",
 *   message: "You do not have permission to access this user's data"
 * })
 * ```
 */
export type UserForbiddenError = ErrorBase & {
  code: "USER_FORBIDDEN";
};

/**
 * User email already exists error - email is already registered.
 * Used when attempting to register with an email that's already in use.
 *
 * @example
 * ```typescript
 * fail({
 *   code: "USER_EMAIL_ALREADY_EXISTS",
 *   message: "Email already in use"
 * })
 * ```
 */
export type UserEmailAlreadyExistsError = ErrorBase & {
  code: "USER_EMAIL_ALREADY_EXISTS";
};

/**
 * User invalid email error - email format is invalid.
 * Used when email validation fails.
 *
 * @example
 * ```typescript
 * fail({
 *   code: "USER_INVALID_EMAIL",
 *   message: "Invalid email format"
 * })
 * ```
 */
export type UserInvalidEmailError = ErrorBase & {
  code: "USER_INVALID_EMAIL";
};

/**
 * User invalid password error - password doesn't meet requirements.
 * Used when password validation fails.
 *
 * @example
 * ```typescript
 * fail({
 *   code: "USER_INVALID_PASSWORD",
 *   message: "Password must be at least 8 characters long"
 * })
 * ```
 */
export type UserInvalidPasswordError = ErrorBase & {
  code: "USER_INVALID_PASSWORD";
};

/**
 * User invalid credentials error - login failed (wrong email or password).
 * Used when login attempt fails due to incorrect credentials.
 *
 * @example
 * ```typescript
 * fail({
 *   code: "USER_INVALID_CREDENTIALS",
 *   message: "Invalid email or password"
 * })
 * ```
 */
export type UserInvalidCredentialsError = ErrorBase & {
  code: "USER_INVALID_CREDENTIALS";
};

/**
 * User company not found error - referenced company doesn't exist.
 * Used when attempting to assign a user to a non-existent company.
 *
 * @example
 * ```typescript
 * fail({
 *   code: "USER_COMPANY_NOT_FOUND",
 *   message: "Company not found"
 * })
 * ```
 */
export type UserCompanyNotFoundError = ErrorBase & {
  code: "USER_COMPANY_NOT_FOUND";
};

/**
 * User project not found error - referenced project doesn't exist.
 * Used when attempting to assign a user to a non-existent project.
 *
 * @example
 * ```typescript
 * fail({
 *   code: "USER_PROJECT_NOT_FOUND",
 *   message: "Project not found"
 * })
 * ```
 */
export type UserProjectNotFoundError = ErrorBase & {
  code: "USER_PROJECT_NOT_FOUND";
};

/**
 * User role not found error - referenced role doesn't exist.
 * Used when attempting to assign a non-existent role to a user.
 *
 * @example
 * ```typescript
 * fail({
 *   code: "USER_ROLE_NOT_FOUND",
 *   message: "Role not found"
 * })
 * ```
 */
export type UserRoleNotFoundError = ErrorBase & {
  code: "USER_ROLE_NOT_FOUND";
};

/**
 * User current password invalid error - current password is incorrect.
 * Used when attempting to change password with wrong current password.
 *
 * @example
 * ```typescript
 * fail({
 *   code: "USER_CURRENT_PASSWORD_INVALID",
 *   message: "Current password is incorrect"
 * })
 * ```
 */
export type UserCurrentPasswordInvalidError = ErrorBase & {
  code: "USER_CURRENT_PASSWORD_INVALID";
};

/**
 * User invitation not found error - no invitation exists for this email.
 * Used when attempting to register without an invitation.
 *
 * @example
 * ```typescript
 * fail({
 *   code: "USER_INVITATION_NOT_FOUND",
 *   message: "No invitation found for this email address"
 * })
 * ```
 */
export type UserInvitationNotFoundError = ErrorBase & {
  code: "USER_INVITATION_NOT_FOUND";
};

/**
 * User invitation expired error - invitation has passed its due date.
 * Used when attempting to register with an expired invitation.
 *
 * @example
 * ```typescript
 * fail({
 *   code: "USER_INVITATION_EXPIRED",
 *   message: "This invitation has expired"
 * })
 * ```
 */
export type UserInvitationExpiredError = ErrorBase & {
  code: "USER_INVITATION_EXPIRED";
};

/**
 * User invitation cancelled error - invitation has been cancelled.
 * Used when attempting to register with a cancelled invitation.
 *
 * @example
 * ```typescript
 * fail({
 *   code: "USER_INVITATION_CANCELLED",
 *   message: "This invitation has been cancelled"
 * })
 * ```
 */
export type UserInvitationCancelledError = ErrorBase & {
  code: "USER_INVITATION_CANCELLED";
};

/**
 * User invitation already exists error - invitation already exists for this email.
 * Used when attempting to send an invitation to an email that already has a pending invitation.
 *
 * @example
 * ```typescript
 * fail({
 *   code: "USER_INVITATION_ALREADY_EXISTS",
 *   message: "An invitation already exists for this email address"
 * })
 * ```
 */
export type UserInvitationAlreadyExistsError = ErrorBase & {
  code: "USER_INVITATION_ALREADY_EXISTS";
};
