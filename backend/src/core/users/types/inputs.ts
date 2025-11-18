/**
 * Input types for Users domain
 *
 * These types represent data coming from external sources (HTTP requests, API calls).
 * They are typically validated by Zod schemas in route handlers before reaching the core.
 */

/**
 * Input for creating a new user
 */
export type CreateUserInput = {
  email: string;
  name?: string;
  surname?: string;
  password: string;
};

export type UpdateUserInput = {
  email?: string;
  name?: string;
  password?: string;
};

/**
 * Input for user login
 */
export type LoginInput = {
  email: string;
  password: string;
};

/**
 * Input for assigning a user to a company
 */
export type AssignToCompanyInput = {
  userId: string;
  companyId: number;
};

/**
 * Input for assigning a user to a project
 */
export type AssignToProjectInput = {
  userId: string;
  projectId: number;
};

/**
 * Input for assigning a role to a user
 */
export type AssignRoleInput = {
  userId: string;
  roleId: number;
};

/**
 * Input for updating user profile
 */
export type UpdateProfileInput = {
  userId: string;
  name?: string;
  surname?: string;
  bio?: string;
};

/**
 * Input for updating user password
 */
export type UpdatePasswordInput = {
  userId: string;
  currentPassword: string;
  newPassword: string;
};
