/**
 * Cookie Utilities for Authentication
 *
 * Provides secure httpOnly cookie management for JWT tokens.
 * This approach protects tokens from XSS attacks by preventing
 * JavaScript access to the authentication token.
 */

import { env } from "#infrastructure/config/env";
import type { Response } from "express";

import { AUTH_COOKIE_MAX_AGE, AUTH_COOKIE_NAME } from "./constants";

/**
 * Set JWT token in httpOnly cookie
 *
 * Security features:
 * - httpOnly: Prevents JavaScript access (XSS protection)
 * - secure: Only sent over HTTPS in production
 * - sameSite: Strict CSRF protection
 *
 * @param res - Express response object
 * @param token - JWT token to store
 */
export function setAuthCookie(res: Response, token: string): void {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: AUTH_COOKIE_MAX_AGE,
    path: "/",
  });
}

/**
 * Clear auth cookie on logout
 *
 * Must use same options as setAuthCookie for browser to clear it
 *
 * @param res - Express response object
 */
export function clearAuthCookie(res: Response): void {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
}
