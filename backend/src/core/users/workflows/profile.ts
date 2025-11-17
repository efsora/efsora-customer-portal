import { type Result } from "#lib/result/index";

import {
  updateProfile as updateProfileOp,
  updatePassword as updatePasswordOp,
} from "../operations/profile";
import type { UpdateProfileInput, UpdatePasswordInput } from "../types/inputs";
import type { ProfileUpdateResult } from "../types/outputs";

/**
 * Update user profile workflow
 * Orchestrates: validate user → update profile fields
 *
 * @param input - User ID and profile fields (name, surname, bio)
 * @returns Result with updated user data
 */
export function updateUserProfile(
  input: UpdateProfileInput,
): Result<ProfileUpdateResult> {
  return updateProfileOp(input);
}

/**
 * Update user password workflow
 * Orchestrates: validate user → verify current password → hash new password → update
 *
 * @param input - User ID, current password, and new password
 * @returns Result with updated user data
 */
export function updateUserPassword(
  input: UpdatePasswordInput,
): Result<ProfileUpdateResult> {
  return updatePasswordOp(input);
}
