import { portalMailInvitationRepository } from "#infrastructure/repositories/drizzle";
import type { Result } from "#lib/result/index";
import { allNamed, chain, command, fail, success } from "#lib/result/index";

import type { SendInvitationInput } from "../types/inputs";
import type { SendInvitationResult } from "../types/outputs";
import { Email } from "../value-objects/Email";

type ValidatedEmailData = {
  email: string;
};

/**
 * Validate email format
 */
export function validateEmail(
  input: SendInvitationInput,
): Result<ValidatedEmailData> {
  return chain(
    allNamed({
      email: Email.create(input.email),
    }),
    (result) =>
      success({
        email: Email.toString(result.email),
      }),
  );
}

/**
 * Check if a pending invitation already exists for this email
 */
export function checkInvitationExists(
  data: ValidatedEmailData,
): Result<ValidatedEmailData> {
  return command(
    async () => {
      const existingInvitation =
        await portalMailInvitationRepository.findByEmail(data.email);
      return existingInvitation;
    },
    (invitation) => {
      // If invitation exists and is PENDING, reject
      if (invitation?.status === "PENDING") {
        // Check if it's expired - if expired, allow creating new one
        const now = new Date();
        if (invitation.dueDate > now) {
          return fail({
            code: "USER_INVITATION_ALREADY_EXISTS",
            message:
              "An active invitation already exists for this email address. Please check your inbox or wait for it to expire.",
          });
        }
      }

      // Allow if: no invitation exists, or invitation is ACCEPTED/CANCELLED/EXPIRED
      return success(data);
    },
  );
}

/**
 * Create or update invitation record in database
 * If invitation exists (even if expired/accepted/cancelled), update it to PENDING with new dueDate
 */
export function createInvitation(
  data: ValidatedEmailData,
): Result<SendInvitationResult> {
  return command(
    async () => {
      // Create or update invitation with 48-hour expiration
      const dueDate = new Date(Date.now() + 48 * 60 * 60 * 1000);

      const invitation = await portalMailInvitationRepository.upsert({
        email: data.email,
        status: "PENDING",
        dueDate,
      });

      return invitation;
    },
    (invitation) => {
      // TODO: Send email notification here
      // await emailService.sendInvitation(invitation.email, invitation.dueDate);

      return success({
        email: invitation.email,
        status: invitation.status,
        dueDate: invitation.dueDate,
        message:
          "Invitation sent successfully. The invitation will expire in 48 hours.",
      });
    },
  );
}
