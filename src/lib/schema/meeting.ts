import { z } from "zod";

export const meetingIdSchema = z.string().trim().min(1);

export const meetingSessionSchema = z.object({
  meetingId: meetingIdSchema,
  authToken: z.string().min(1),
});

export type MeetingId = z.infer<typeof meetingIdSchema>;
export type MeetingSession = z.infer<typeof meetingSessionSchema>;
