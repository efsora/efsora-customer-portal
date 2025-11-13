import type { UpdateProfileInput, UpdatePasswordInput } from "../types/inputs";
import type { ProfileUpdateResult } from "../types/outputs";

import { userRepository } from "#infrastructure/repositories/drizzle";
import first from "lodash/fp/first";

import { command, Result, fail, success } from "#lib/result/index";
import { mapUserToExtendedUserData } from "../mappers";
import bcrypt from "bcrypt";

/**
 * Updates user profile (name, surname, bio)
 * Validates that user exists before update
 */
export function updateProfile(
  input: UpdateProfileInput,
): Result<ProfileUpdateResult> {
  return command(
    async () => {
      // Validate user exists
      const users = await userRepository.findById(input.userId);
      const user = first(users);
      if (!user) {
        return { type: "user_not_found" as const };
      }

      // Update user profile
      const updatedUsers = await userRepository.update(input.userId, {
        name: input.name,
        surname: input.surname,
        bio: input.bio,
      });
      const updatedUser = first(updatedUsers);

      if (!updatedUser) {
        return { type: "update_failed" as const };
      }

      return { type: "success" as const, user: updatedUser };
    },
    (result) => {
      if (result.type === "user_not_found") {
        return fail({
          code: "USER_NOT_FOUND",
          message: "User not found",
        });
      }
      if (result.type === "update_failed") {
        return fail({
          code: "USER_NOT_FOUND",
          message: "Failed to update user profile",
        });
      }
      return success(mapUserToExtendedUserData(result.user));
    },
  );
}

/**
 * Updates user password
 * Validates current password before allowing update
 */
export function updatePassword(
  input: UpdatePasswordInput,
): Result<ProfileUpdateResult> {
  return command(
    async () => {
      // Validate user exists
      const users = await userRepository.findById(input.userId);
      const user = first(users);
      if (!user) {
        return { type: "user_not_found" as const };
      }

      // Validate new password length
      if (!input.newPassword || input.newPassword.length < 8) {
        return { type: "invalid_new_password" as const };
      }

      // Verify current password using bcrypt
      const isCurrentPasswordValid = await bcrypt.compare(
        input.currentPassword,
        user.password,
      );

      if (!isCurrentPasswordValid) {
        return { type: "invalid_current_password" as const };
      }

      // Hash new password using bcrypt
      const newPasswordHash = await bcrypt.hash(input.newPassword, 10);

      // Update user password
      const updatedUsers = await userRepository.update(input.userId, {
        password: newPasswordHash,
      });
      const updatedUser = first(updatedUsers);

      if (!updatedUser) {
        return { type: "update_failed" as const };
      }

      return { type: "success" as const, user: updatedUser };
    },
    (result) => {
      if (result.type === "user_not_found") {
        return fail({
          code: "USER_NOT_FOUND",
          message: "User not found",
        });
      }
      if (result.type === "invalid_current_password") {
        return fail({
          code: "USER_CURRENT_PASSWORD_INVALID",
          message: "Current password is incorrect",
        });
      }
      if (result.type === "invalid_new_password") {
        return fail({
          code: "USER_INVALID_PASSWORD",
          message: "New password must be at least 8 characters long",
        });
      }
      if (result.type === "update_failed") {
        return fail({
          code: "USER_NOT_FOUND",
          message: "Failed to update user password",
        });
      }
      return success(mapUserToExtendedUserData(result.user));
    },
  );
}
