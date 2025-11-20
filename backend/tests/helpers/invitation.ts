/**
 * Invitation Test Helpers
 *
 * Provides utilities for creating test invitations and users with invitations
 */

import type { CreateUserInput } from "#core/users";
import { createUser as coreCreateUser } from "#core/users";
import { portalMailInvitations } from "#db/schema";
import { run } from "#lib/result/index";
import { getTestDb } from "./database";

/**
 * Create a valid invitation for testing
 * @param email Email address to invite
 * @param hoursValid Number of hours the invitation should be valid (default: 48)
 */
export async function createTestInvitation(
  email: string,
  hoursValid = 48,
): Promise<void> {
  const db = getTestDb();
  const dueDate = new Date(Date.now() + hoursValid * 60 * 60 * 1000);

  await db.insert(portalMailInvitations).values({
    email,
    status: "PENDING",
    dueDate,
  });
}

/**
 * Create multiple invitations at once
 * @param emails Array of email addresses to invite
 * @param hoursValid Number of hours the invitations should be valid (default: 48)
 */
export async function createTestInvitations(
  emails: string[],
  hoursValid = 48,
): Promise<void> {
  const db = getTestDb();
  const dueDate = new Date(Date.now() + hoursValid * 60 * 60 * 1000);

  await db.insert(portalMailInvitations).values(
    emails.map((email) => ({
      email,
      status: "PENDING",
      dueDate,
    })),
  );
}

/**
 * Create a test user with automatic invitation creation
 * This is a convenience wrapper that creates an invitation before creating the user
 *
 * @param input User creation input
 * @param hoursValid Number of hours the invitation should be valid (default: 48)
 * @returns Result from createUser workflow
 */
export async function createTestUser(input: CreateUserInput, hoursValid = 48) {
  // Automatically create invitation for the email
  await createTestInvitation(input.email, hoursValid);

  // Create the user
  return await run(coreCreateUser(input));
}
