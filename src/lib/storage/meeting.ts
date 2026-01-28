const STORAGE_KEY = "laoke_last_meeting";

export function getLastMeetingId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveLastMeetingId(meetingId: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, meetingId);
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
