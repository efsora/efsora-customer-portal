/**
 * Session Management Module
 *
 * Provides utilities for session lifecycle management.
 *
 * Note: Expired sessions are automatically deleted by the auth middleware
 * when encountered, so no separate cleanup job is needed.
 *
 * This module exports:
 * - logoutAllDevices: Force logout from all devices (security feature)
 */

export { logoutAllDevices } from "./cleanup";
