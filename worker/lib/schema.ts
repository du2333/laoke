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

export const meetingMetadataResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.string(),
    title: z.string().optional(),
    status: z.string().optional(),
    created_at: z.string().optional(),
  }),
});

export const meetingResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.string(),
    title: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    created_at: z.string().nullable().optional(),
  }),
});

export const meetingListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(
    z.object({
      id: z.string(),
      title: z.string().nullable().optional(),
      status: z.string().nullable().optional(),
      created_at: z.string().nullable().optional(),
    }),
  ),
});

export const activeSessionResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    live_participants: z.number(),
  }),
});

export type IssueTokenResponse = z.infer<typeof issueTokenResponseSchema>;
export type MeetingMetadataResponse = z.infer<
  typeof meetingMetadataResponseSchema
>;
