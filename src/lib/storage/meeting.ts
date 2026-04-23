import { meetingIdSchema, type MeetingId } from "../schema/meeting";

const STORAGE_KEY = "laoke_last_meeting";

export function getLastMeetingId(): MeetingId | null {
  try {
    const result = meetingIdSchema.safeParse(localStorage.getItem(STORAGE_KEY));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function saveLastMeetingId(meetingId: MeetingId): void {
  try {
    const result = meetingIdSchema.safeParse(meetingId);
    if (!result.success) return;
    localStorage.setItem(STORAGE_KEY, result.data);
  } catch {
    // Ignore storage errors
  }
}

export function clearLastMeetingId(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}
