import { z } from "zod";

export const joinRequestSchema = z.object({
  meetingId: z.string().min(1),
  userId: z.string().min(1),
  userName: z.string().min(1).max(20),
});

export const meetingMetadataParamsSchema = z.object({
  meetingId: z.string().min(1),
});

export const adminAuthHeaderSchema = z.object({
  authorization: z.string().optional(),
});

export const createMeetingRequestSchema = z.object({
  title: z.string().trim().min(1).max(80),
});

export const manageMeetingParamsSchema = z.object({
  meetingId: z.string().min(1),
});

export type JoinRequest = z.infer<typeof joinRequestSchema>;
export type MeetingMetadataParams = z.infer<typeof meetingMetadataParamsSchema>;
export type AdminAuthHeader = z.infer<typeof adminAuthHeaderSchema>;
export type CreateMeetingRequest = z.infer<typeof createMeetingRequestSchema>;
export type ManageMeetingParams = z.infer<typeof manageMeetingParamsSchema>;
