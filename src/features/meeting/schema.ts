import { z } from "zod";

export const meetingIdSchema = z.string().trim().min(1);

export const createMeetingInputSchema = z.object({
  title: z.string().trim().min(1).max(80),
});

export const joinMeetingInputSchema = z.object({
  meetingId: meetingIdSchema,
  userId: z.string().trim().min(1),
  userName: z.string().trim().min(1).max(20),
  adminToken: z.string().min(1).optional(),
});

export const getMeetingMetadataInputSchema = z.object({
  meetingId: meetingIdSchema,
});

export const deactivateMeetingInputSchema = z.object({
  meetingId: meetingIdSchema,
});

export const listMeetingsInputSchema = z.object({
  pageNo: z.number().int().nonnegative().optional(),
  perPage: z.number().int().positive().max(100).optional(),
});

export const managedMeetingSchema = z.object({
  meetingId: meetingIdSchema,
  meetingTitle: z.string().nullable(),
  status: z.string().nullable(),
  createdAt: z.string().nullable(),
});

export const meetingSessionSchema = z.object({
  meetingId: meetingIdSchema,
  authToken: z.string().min(1),
});

export const meetingMetadataSchema = z.object({
  meetingId: meetingIdSchema,
  meetingTitle: z.string().nullable(),
  liveParticipants: z.number().int().nonnegative(),
});

export const managedMeetingListSchema = z.object({
  meetings: z.array(managedMeetingSchema),
  nextPageNo: z.number().int().nonnegative().nullable(),
});

export type MeetingId = z.infer<typeof meetingIdSchema>;
export type CreateMeetingInput = z.infer<typeof createMeetingInputSchema>;
export type JoinMeetingInput = z.infer<typeof joinMeetingInputSchema>;
export type GetMeetingMetadataInput = z.infer<typeof getMeetingMetadataInputSchema>;
export type DeactivateMeetingInput = z.infer<typeof deactivateMeetingInputSchema>;
export type ListMeetingsInput = z.infer<typeof listMeetingsInputSchema>;
export type ManagedMeeting = z.infer<typeof managedMeetingSchema>;
export type MeetingSession = z.infer<typeof meetingSessionSchema>;
export type MeetingMetadata = z.infer<typeof meetingMetadataSchema>;
export type ManagedMeetingList = z.infer<typeof managedMeetingListSchema>;
