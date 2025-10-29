/**
 * Output types for Users domain
 *
 * These types represent data returned to external consumers (HTTP responses).
 * They typically exclude sensitive fields (e.g., password hashes).
 */

/**
 * Public user data (without password field)
 * Safe for API responses
 */
export interface PublicUserData {
  createdAt: Date;
  email: string;
  id: number;
  name: null | string;
  updatedAt: Date;
}

/**
 * Update user result
 * Optionally includes authentication token when generated
 */
export interface UpdateUserResult {
  createdAt: Date;
  email: string;
  id: number;
  name: null | string;
  token?: string;
  updatedAt: Date;
}

/**
 * User data for responses (without password)
 */
export interface UserData {
  createdAt: Date;
  email: string;
  id: number;
  name: null | string;
  updatedAt: Date;
}