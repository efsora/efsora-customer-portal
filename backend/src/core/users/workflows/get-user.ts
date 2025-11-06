import { type Result, pipe } from "#lib/result/index";

import { findUserById, findAllUsers } from "../operations/find";
import { UserData } from "../types/outputs.js";

/**
 * Get user by ID workflow
 * Orchestrates: find user → check authorization
 *
 * @param userId - ID of the user to fetch
 * @param requestUserId - ID of the user making the request (from JWT)
 * @returns Result with user data (excluding password)
 */
export function getUserById(userId: string): Result<UserData> {
  return pipe(findUserById(userId));
}


/** 
 * Get all users workflow
 */
export function getAllUsers(): Result<UserData[]> {
  return findAllUsers();
}