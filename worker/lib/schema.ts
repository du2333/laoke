import { z } from "zod";

export const createMeetingResponseSchema = z.object({
  id: z.string().optional(),
  result: z
    .object({
      id: z.string().optional(),
    })
    .optional(),
  data: z
    .object({
      id: z.string().optional(),
    })
    .optional(),
});

export const issueTokenResponseSchema = z.object({
  data: z
    .object({
      token: z.string(),
    })
    .optional(),
  token: z.string().optional(),
  auth_token: z.string().optional(),
});

export const presetSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  preset_id: z.string().optional(),
});
export const listPresetsResponseSchema = z
  .object({
    result: z.array(presetSchema).optional(),
    data: z.array(presetSchema).optional(),
  })
  .or(z.array(presetSchema));

export type CreateMeetingResponse = z.infer<typeof createMeetingResponseSchema>;
export type IssueTokenResponse = z.infer<typeof issueTokenResponseSchema>;
export type ListPresetsResponse = z.infer<typeof listPresetsResponseSchema>;
