import { z } from "zod";

export const meetingIdSchema = z.string().trim().min(1);

export const meetingHistoryItemSchema = z.object({
  meetingId: meetingIdSchema,
  meetingTitle: z.string().nullable().optional(),
  lastJoinedAt: z.number(),
});

export const meetingIdHistorySchema = z.array(meetingHistoryItemSchema);

export const meetingSessionSchema = z.object({
  meetingId: meetingIdSchema,
  authToken: z.string().min(1),
});

export const meetingMetadataSchema = z.object({
  meetingId: meetingIdSchema,
  meetingTitle: z.string().nullable(),
  liveParticipants: z.number().int().nonnegative(),
  isLive: z.boolean(),
});

export const managedMeetingSchema = z.object({
  meetingId: meetingIdSchema,
  meetingTitle: z.string().nullable(),
  status: z.string().nullable(),
  createdAt: z.string().nullable(),
});

export const managedMeetingListSchema = z.object({
  meetings: z.array(managedMeetingSchema),
});

export type MeetingId = z.infer<typeof meetingIdSchema>;
export type MeetingHistoryItem = z.infer<typeof meetingHistoryItemSchema>;
export type MeetingIdHistory = z.infer<typeof meetingIdHistorySchema>;
export type MeetingSession = z.infer<typeof meetingSessionSchema>;
export type MeetingMetadata = z.infer<typeof meetingMetadataSchema>;
export type ManagedMeeting = z.infer<typeof managedMeetingSchema>;
