import {
  meetingIdHistorySchema,
  meetingIdSchema,
  type MeetingId,
  type MeetingIdHistory,
} from "@/lib/schema/meeting";

const STORAGE_KEY = "laoke_meeting_history";
const LEGACY_STORAGE_KEY = "laoke_last_meeting";
const MAX_HISTORY_ITEMS = 10;

function normalizeMeetingHistory(history: MeetingIdHistory): MeetingIdHistory {
  return [...new Set(history)].slice(0, MAX_HISTORY_ITEMS);
}

function readLegacyMeetingId(): MeetingId | null {
  const result = meetingIdSchema.safeParse(localStorage.getItem(LEGACY_STORAGE_KEY));
  return result.success ? result.data : null;
}

export function getMeetingHistory(): MeetingIdHistory {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const result = meetingIdHistorySchema.safeParse(JSON.parse(stored));
      if (result.success) return normalizeMeetingHistory(result.data);
    }

    const legacyMeetingId = readLegacyMeetingId();
    if (!legacyMeetingId) return [];

    const migratedHistory = [legacyMeetingId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedHistory));
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    return migratedHistory;
  } catch {
    return [];
  }
}

export function saveMeetingId(meetingId: MeetingId): MeetingIdHistory {
  try {
    const result = meetingIdSchema.safeParse(meetingId);
    if (!result.success) return getMeetingHistory();

    const nextHistory = [
      result.data,
      ...getMeetingHistory().filter((item) => item !== result.data),
    ].slice(0, MAX_HISTORY_ITEMS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory));
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    return nextHistory;
  } catch {
    return getMeetingHistory();
  }
}

export function removeMeetingId(meetingId: MeetingId): MeetingIdHistory {
  try {
    const result = meetingIdSchema.safeParse(meetingId);
    if (!result.success) return getMeetingHistory();

    const nextHistory = getMeetingHistory().filter((item) => item !== result.data);

    if (nextHistory.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      return [];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory));
    return nextHistory;
  } catch {
    return getMeetingHistory();
  }
}

export function clearMeetingHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}
