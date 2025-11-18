import type {
  AssignToCompanyInput,
  AssignToProjectInput,
  AssignRoleInput,
} from "../types/inputs";
import type { AssignmentResult } from "../types/outputs";

import {
  userRepository,
  companyRepository,
  projectRepository,
  roleRepository,
} from "#infrastructure/repositories/drizzle";
import first from "lodash/fp/first";

import { command, Result, fail, success } from "#lib/result/index";
import { mapUserToExtendedUserData } from "../mappers";

/**
 * Assigns a user to a company
 * Validates that both user and company exist before assignment
 */
export function assignToCompany(
  input: AssignToCompanyInput,
): Result<AssignmentResult> {
  return command(
    async () => {
      // Validate user exists
      const users = await userRepository.findById(input.userId);
      const user = first(users);
      if (!user) {
        return { type: "user_not_found" as const };
      }

      // Validate company exists
      const companies = await companyRepository.findById(input.companyId);
      const company = first(companies);
      if (!company) {
        return { type: "company_not_found" as const };
      }

      // Update user with company assignment
      const updatedUsers = await userRepository.update(input.userId, {
        companyId: input.companyId,
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
      if (result.type === "company_not_found") {
        return fail({
          code: "USER_COMPANY_NOT_FOUND",
          message: "Company not found",
        });
      }
      if (result.type === "update_failed") {
        return fail({
          code: "USER_NOT_FOUND",
          message: "Failed to update user",
        });
      }
      return success(mapUserToExtendedUserData(result.user));
    },
  );
}

/**
 * Assigns a user to a project
 * Validates that both user and project exist before assignment
 */
export function assignToProject(
  input: AssignToProjectInput,
): Result<AssignmentResult> {
  return command(
    async () => {
      // Validate user exists
      const users = await userRepository.findById(input.userId);
      const user = first(users);
      if (!user) {
        return { type: "user_not_found" as const };
      }

      // Validate project exists
      const projects = await projectRepository.findById(input.projectId);
      const project = first(projects);
      if (!project) {
        return { type: "project_not_found" as const };
      }

      // Update user with project assignment
      const updatedUsers = await userRepository.update(input.userId, {
        projectId: input.projectId,
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
      if (result.type === "project_not_found") {
        return fail({
          code: "USER_PROJECT_NOT_FOUND",
          message: "Project not found",
        });
      }
      if (result.type === "update_failed") {
        return fail({
          code: "USER_NOT_FOUND",
          message: "Failed to update user",
        });
      }
      return success(mapUserToExtendedUserData(result.user));
    },
  );
}

/**
 * Assigns a role to a user
 * Validates that both user and role exist before assignment
 */
export function assignRole(input: AssignRoleInput): Result<AssignmentResult> {
  return command(
    async () => {
      // Validate user exists
      const users = await userRepository.findById(input.userId);
      const user = first(users);
      if (!user) {
        return { type: "user_not_found" as const };
      }

      // Validate role exists
      const roles = await roleRepository.findById(input.roleId);
      const role = first(roles);
      if (!role) {
        return { type: "role_not_found" as const };
      }

      // Update user with role assignment
      const updatedUsers = await userRepository.update(input.userId, {
        roleId: input.roleId,
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
      if (result.type === "role_not_found") {
        return fail({
          code: "USER_ROLE_NOT_FOUND",
          message: "Role not found",
        });
      }
      if (result.type === "update_failed") {
        return fail({
          code: "USER_NOT_FOUND",
          message: "Failed to update user",
        });
      }
      return success(mapUserToExtendedUserData(result.user));
    },
  );
}
