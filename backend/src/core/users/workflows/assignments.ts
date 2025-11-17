import { type Result } from "#lib/result/index";

import {
  assignToCompany as assignToCompanyOp,
  assignToProject as assignToProjectOp,
  assignRole as assignRoleOp,
} from "../operations/assignments";
import type {
  AssignToCompanyInput,
  AssignToProjectInput,
  AssignRoleInput,
} from "../types/inputs";
import type { AssignmentResult } from "../types/outputs";

/**
 * Assign user to company workflow
 * Orchestrates: validate user → validate company → assign
 *
 * @param input - User ID and Company ID
 * @returns Result with updated user data including company assignment
 */
export function assignUserToCompany(
  input: AssignToCompanyInput,
): Result<AssignmentResult> {
  return assignToCompanyOp(input);
}

/**
 * Assign user to project workflow
 * Orchestrates: validate user → validate project → assign
 *
 * @param input - User ID and Project ID
 * @returns Result with updated user data including project assignment
 */
export function assignUserToProject(
  input: AssignToProjectInput,
): Result<AssignmentResult> {
  return assignToProjectOp(input);
}

/**
 * Assign role to user workflow
 * Orchestrates: validate user → validate role → assign
 *
 * @param input - User ID and Role ID
 * @returns Result with updated user data including role assignment
 */
export function assignUserRole(
  input: AssignRoleInput,
): Result<AssignmentResult> {
  return assignRoleOp(input);
}
