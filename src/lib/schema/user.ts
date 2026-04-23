import { z } from "zod";

export const userNameSchema = z.string().trim().min(1).max(15);

export const userSchema = z.object({
  id: z.string().min(1),
  name: userNameSchema,
  createdAt: z.number(),
});

export type User = z.infer<typeof userSchema>;
