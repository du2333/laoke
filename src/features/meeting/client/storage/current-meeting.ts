import { createClientOnlyFn } from "@tanstack/react-start";

import { meetingSessionSchema, type MeetingSession } from "@/features/meeting/schema";

const STORAGE_KEY = "laoke_current_meeting_session";

export const getCurrentMeetingSession = createClientOnlyFn((): MeetingSession | null => {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const result = meetingSessionSchema.safeParse(JSON.parse(stored));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
});

export const saveCurrentMeetingSession = createClientOnlyFn((session: MeetingSession) => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(meetingSessionSchema.parse(session)));
});

export const clearCurrentMeetingSession = createClientOnlyFn(() => {
  sessionStorage.removeItem(STORAGE_KEY);
});
