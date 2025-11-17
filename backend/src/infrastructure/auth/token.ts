import { env } from "#infrastructure/config/env";
import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";

/**
 * Generates a JWT authentication token for a user
 *
 * This is infrastructure code (imperative shell), not business logic,
 * because it depends on external libraries (jsonwebtoken) and environment configuration.
 *
 * Business logic would be: "A logged-in user needs a token"
 * Infrastructure: "We use JWT with HS256, 7-day expiration, and JWT_SECRET from env"
 *
 * Each token includes a unique JTI (JWT ID) to ensure uniqueness even when
 * multiple tokens are generated for the same user in the same second.
 * This is critical for session-based auth where tokens must be unique in the database.
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
  // Generate unique JTI (JWT ID) to prevent token collisions
  // when multiple logins happen in the same second
  const jti = randomBytes(16).toString("hex");

  return jwt.sign({ email, userId, jti }, env.JWT_SECRET, {
    expiresIn: "7d",
  });
}
