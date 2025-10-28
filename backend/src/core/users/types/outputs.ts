/**
 * Output types for Users domain
 *
 * These types represent data returned to external consumers (HTTP responses).
 * They typically exclude sensitive fields (e.g., password hashes).
 */

/**
 * Login result with user data
 * Optionally includes authentication token when generated
 */
export interface LoginResult {
    email: string;
    id: number;
    name: null | string;
    token?: string;
  }
  
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
   * Registration result (user data after saving to database)
   * Optionally includes authentication token when generated
   */
  export interface RegisterResult {
    email: string;
    id: number;
    name: null | string;
    token?: string;
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