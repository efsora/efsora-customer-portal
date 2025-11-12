import { db } from "#db/client";
import { users } from "#db/schema";
import { inArray, like, or } from "drizzle-orm";
import type { ValidatedRequest } from "#middlewares/validate";

/**
 * DELETE /test/cleanup
 * Clean up specific test users by user IDs (development only)
 */
export async function handleTestCleanup(
  req: ValidatedRequest<{ body: { userIds: string[] } }>,
): Promise<any> {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return {
      success: false,
      message: "Test cleanup is not available in production",
    };
  }

  const { userIds } = req.validated.body;

  try {
    const deletedUsers = await db
      .delete(users)
      .where(inArray(users.id, userIds))
      .returning();

    return {
      success: true,
      data: {
        deletedCount: deletedUsers.length,
        deletedUsers: deletedUsers.map((u: any) => ({
          id: u.id,
          email: u.email,
        })),
      },
      message: `Deleted ${deletedUsers.length} test users`,
    };
  } catch (error) {
    console.error("Test cleanup error:", error);
    return {
      success: false,
      message: "Failed to cleanup test users",
    };
  }
}

/**
 * DELETE /test/cleanup-all
 * Clean up all test users by email patterns (development only)
 */
export async function handleCleanupAllTestUsers(
  req: ValidatedRequest<{ body: { emailPatterns: string[] } }>,
): Promise<any> {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return {
      success: false,
      message: "Test cleanup is not available in production",
    };
  }

  const { emailPatterns } = req.validated.body;

  try {
    // Build OR condition for multiple patterns
    const conditions = emailPatterns.map((pattern) =>
      like(users.email, pattern),
    );
    const whereCondition =
      conditions.length === 1 ? conditions[0] : or(...conditions);

    const deletedUsers = await db
      .delete(users)
      .where(whereCondition)
      .returning();

    return {
      success: true,
      data: {
        deletedCount: deletedUsers.length,
        deletedUsers: deletedUsers.map((u: any) => ({
          id: u.id,
          email: u.email,
        })),
      },
      message: `Deleted ${deletedUsers.length} test users`,
    };
  } catch (error) {
    console.error("Test cleanup all error:", error);
    return {
      success: false,
      message: "Failed to cleanup test users",
    };
  }
}
