import { z } from "zod";

export const issueTokenResponseSchema = z.object({
  data: z
    .object({
      token: z.string(),
    })
    .optional(),
  token: z.string().optional(),
  auth_token: z.string().optional(),
});

export type IssueTokenResponse = z.infer<typeof issueTokenResponseSchema>;
