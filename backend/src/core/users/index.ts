/**
 * Users Module
 * Public API for user operations
 */

// Workflows - Core operations
export { createUser } from "./workflows/create-user";
export { login } from "./workflows/login";
export { getUserById } from "./workflows/get-user";
export { getAllUsers } from "./workflows/get-user";

// Workflows - Assignment operations
export {
  assignUserToCompany,
  assignUserToProject,
  assignUserRole,
} from "./workflows/assignments";

// Workflows - Profile operations
export { updateUserProfile, updateUserPassword } from "./workflows/profile";

// Public types - Inputs
export type {
  CreateUserInput,
  UpdateUserInput,
  LoginInput,
  AssignToCompanyInput,
  AssignToProjectInput,
  AssignRoleInput,
  UpdateProfileInput,
  UpdatePasswordInput,
} from "./types/inputs";

// Public types - Outputs
export type {
  CreateUserResult,
  UpdateUserResult,
  UserData,
  LoginResult,
  ExtendedUserData,
  AssignmentResult,
  ProfileUpdateResult,
} from "./types/outputs";

// Public types - Errors
export type {
  UserEmailAlreadyExistsError,
  UserError,
  UserForbiddenError,
  UserInvalidEmailError,
  UserInvalidPasswordError,
  UserNotFoundError,
  UserInvalidCredentialsError,
  UserCompanyNotFoundError,
  UserProjectNotFoundError,
  UserRoleNotFoundError,
  UserCurrentPasswordInvalidError,
} from "./types/errors";

// Value objects
export { Email } from "./value-objects/Email";
export { Password } from "./value-objects/Password";

// Continuation functions (exported for testing)
export { handleSaveNewUserResult } from "./operations/create-user";
export {
  handleFindAllUsersResult,
  handleFindByEmailResult,
  handleFindUserByIdResult,
} from "./operations/find";

// Note: operations, internal types, and other implementation details are intentionally NOT exported
// Handlers should only use workflows from this barrel file
