import { z } from "zod";

export const userSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1),
  createdAt: z.number(),
});

export type User = z.infer<typeof userSchema>;
