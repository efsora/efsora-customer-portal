import { env } from "#infrastructure/config/env";
import jwt from "jsonwebtoken";
import { LOGIN_EXPIRES_AT } from "#infrastructure/auth/constants";

/**
 * Generates a JWT authentication token for a user
 *
 * This is infrastructure code (imperative shell), not business logic,
 * because it depends on external libraries (jsonwebtoken) and environment configuration.
 *
 * Business logic would be: "A logged-in user needs a token"
 * Infrastructure: "We use JWT with HS256, 7-day expiration, and JWT_SECRET from env"
 *
 * @param userId - User's unique identifier
 * @param email - User's email address
 * @returns JWT token string valid for 7 days
 *
 * @example
 * ```typescript
 * // In workflow after successful authentication
 * const token = generateAuthToken(userId, email);
 * return success({ token, user: { id: userId, email, name } });
 * ```
 */
export function generateAuthToken(userId: string, email: string): string {
  return jwt.sign({ email, userId }, env.JWT_SECRET, {
    expiresIn: LOGIN_EXPIRES_AT,
  });
}
