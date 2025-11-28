/**
 * Authentication Constants
 *
 * Centralized configuration for authentication-related values
 */

/**
 * JWT token expiration duration (for jsonwebtoken library)
 * Format: "7d" = 7 days, "24h" = 24 hours, "60m" = 60 minutes
 */
export const JWT_EXPIRES_IN = "7d";

/**
 * Session expiration duration in milliseconds
 * 7 days = 7 * 24 * 60 * 60 * 1000
 */
export const SESSION_EXPIRES_IN_MS: number = 7 * 24 * 60 * 60 * 1000;

/**
 * Cookie name for storing JWT token
 */
export const AUTH_COOKIE_NAME = "access_token";

/**
 * Cookie max age in milliseconds (matches session expiration)
 */
export const AUTH_COOKIE_MAX_AGE = SESSION_EXPIRES_IN_MS;
