import { z } from "zod";

const cleanupBodySchema = z.object({
  userIds: z.array(z.string().uuid()).min(1),
});

const cleanupAllBodySchema = z.object({
  emailPatterns: z.array(z.string()).min(1),
});

export const cleanupSchema = {
  body: cleanupBodySchema,
};

export const cleanupAllSchema = {
  body: cleanupAllBodySchema,
};

export type CleanupPayload = z.infer<typeof cleanupBodySchema>;
export type CleanupAllPayload = z.infer<typeof cleanupAllBodySchema>;
