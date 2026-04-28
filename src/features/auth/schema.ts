import { z } from "zod";

export const adminPasswordInputSchema = z.object({
  adminPassword: z.string().trim().min(1),
});

export const verifyAdminPasswordOutputSchema = z.object({
  ok: z.literal(true),
});
