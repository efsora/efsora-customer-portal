/**
 * Output types for Users domain
 *
 * These types represent data returned to external consumers (HTTP responses).
 * They typically exclude sensitive fields (e.g., password hashes).
 */

/**
 * Create user result with nested structure
 * Follows best practice: separates user data from authentication token
 */
export type CreateUserResult = {
  user: {
    email: string;
    id: string;
    name: string | null;
    surname: string | null;
  };
  token: string;
};

/**
 * Public user data (without password field)
 * Safe for API responses
 */
export type PublicUserData = {
  createdAt: Date;
  email: string;
  id: string;
  name: string | null;
  surname: string | null;
  updatedAt: Date;
};

/**
 * Update user result
 * Optionally includes authentication token when generated
 */
export type UpdateUserResult = {
  createdAt: Date;
  email: string;
  id: string;
  name: string | null;
  surname: string | null;
  token?: string;
  updatedAt: Date;
};

/**
 * User data for responses (without password)
 */
export type UserData = {
  createdAt: Date;
  email: string;
  id: string;
  name: string | null;
  surname: string | null;
  updatedAt: Date;
};

/**
 * Login result with authentication token
 */
export type LoginResult = {
  user: {
    createdAt: Date;
    email: string;
    id: string;
    name: string | null;
    surname: string | null;
    updatedAt: Date;
  };
  token: string;
};

/**
 * Extended user data with company, role, and project information
 */
export type ExtendedUserData = {
  bio: string | null;
  companyId: number | null;
  createdAt: Date;
  email: string;
  id: string;
  name: string | null;
  projectId: number | null;
  roleId: number | null;
  surname: string | null;
  updatedAt: Date;
};

/**
 * Result for assignment operations (company, project, role)
 */
export type AssignmentResult = ExtendedUserData;

/**
 * Result for profile update operation
 */
export type ProfileUpdateResult = ExtendedUserData;

/**
 * Result for sending portal invitation
 */
export type SendInvitationResult = {
  email: string;
  status: string;
  dueDate: Date;
  message: string;
};
