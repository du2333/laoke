import { z } from "zod";

export const adminTokenInputSchema = z
  .object({
    adminToken: z.string().min(1),
  })
  .passthrough();

export type AdminTokenInput = z.infer<typeof adminTokenInputSchema>;
