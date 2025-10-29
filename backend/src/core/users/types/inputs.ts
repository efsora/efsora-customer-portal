/**
 * Input types for Users domain
 *
 * These types represent data coming from external sources (HTTP requests, API calls).
 * They are typically validated by Zod schemas in route handlers before reaching the core.
 */

/**
 * Update user input data
 */
export interface UpdateUserInput {
  email?: string;
  name?: string;
  password?: string;
}