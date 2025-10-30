import { type Effect, pipe } from "#lib/effect/index";

import { findUserById } from "#core/users/find.operations";
import { UserData } from "./types/outputs.js";

/**
 * Get user by ID workflow
 * Orchestrates: find user → check authorization
 *
 * @param userId - ID of the user to fetch
 * @param requestUserId - ID of the user making the request (from JWT)
 * @returns Effect with user data (excluding password)
 */
export function getUserById(userId: number): Effect<UserData> {
  return pipe(
    findUserById(userId),
  );
}
