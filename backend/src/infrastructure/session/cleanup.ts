import { logger } from "#infrastructure/logger/index";
import { sessionRepository } from "#infrastructure/repositories/drizzle";

/**
 * Session Management Utility
 *
 * Provides utility for managing user sessions.
 *
 * Note: Expired sessions are automatically deleted by the auth middleware
 * when encountered, so no separate cleanup job is needed.
 */

/**
 * Logout user from all devices
 *
 * Deletes all sessions for a specific user, forcing re-authentication everywhere.
 *
 * Useful for security scenarios like:
 * - Password reset - force logout from all devices
 * - Account compromise - immediately revoke all access
 * - "Logout from all devices" feature in user settings
 *
 * @param userId - User ID whose sessions should be deleted
 * @returns Promise<number> - Number of sessions deleted
 *
 * @example
 * ```typescript
 * // User clicks "Logout from all devices" in settings
 * await logoutAllDevices(userId);
 *
 * // After password reset - force re-login everywhere
 * await logoutAllDevices(userId);
 *
 * // Account compromised - revoke all access
 * await logoutAllDevices(compromisedUserId);
 * ```
 */
export async function logoutAllDevices(userId: string): Promise<number> {
  try {
    logger.info({ userId }, "Logging out user from all devices");

    const deletedSessions = await sessionRepository.deleteByUserId(userId);
    const count = deletedSessions.length;

    logger.info(
      {
        userId,
        deletedCount: count,
        sessionIds: deletedSessions.map((s) => s.id),
      },
      "Logged out user from all devices",
    );

    return count;
  } catch (error) {
    logger.error(
      {
        userId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to logout user from all devices",
    );
    throw error;
  }
}
