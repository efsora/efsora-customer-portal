import { pipe } from "#lib/result/combinators";
import type { Result } from "#lib/result/index";

import {
  checkInvitationExists,
  createInvitation,
  validateEmail,
} from "../operations/send-invitation";
import type { SendInvitationInput } from "../types/inputs";
import type { SendInvitationResult } from "../types/outputs";

/**
 * Send Portal Invitation Workflow
 *
 * Sends an invitation to a user to register for the portal.
 * Creates a PENDING invitation record in the database with 48-hour expiration.
 *
 * Steps:
 * 1. Validate email format
 * 2. Check if invitation already exists (PENDING status)
 * 3. Create new invitation record
 *
 * Note: Email sending is not yet implemented (TODO)
 *
 * @param input - Email address to send invitation to
 * @returns Result containing invitation details
 */
export function sendInvitation(
  input: SendInvitationInput,
): Result<SendInvitationResult> {
  return pipe(validateEmail(input), checkInvitationExists, createInvitation);
}
