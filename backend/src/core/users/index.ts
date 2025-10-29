/**
 * Users Module
 * Public API for user operations
 */

// Workflows
export { login } from "./login.workflow.js";
export { register } from "./register.workflow.js";
export { getUserById } from "./get-user.workflow.js";

// Public types - Inputs
export type { LoginInput, RegisterInput, UpdateUserInput } from "./types/inputs.js";

// Public types - Outputs
export type { LoginResult, RegisterResult, UserData } from "./types/outputs.js";

// Public types - Errors
export type {
  UserEmailConflictError,
  UserInvalidCredentialsError,
  UserNotFoundError,
  UserForbiddenError,
  UserValidationError,
  UserError,
} from "./types/errors.js";

// Value objects
export { Email } from "./value-objects/Email.js";
export { Password } from "./value-objects/Password.js";

// Note: operations, internal types, and other implementation details are intentionally NOT exported
// Handlers should only use workflows from this barrel file
