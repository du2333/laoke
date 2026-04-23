import {
  meetingHistoryItemSchema,
  meetingIdHistorySchema,
  meetingIdSchema,
  type MeetingHistoryItem,
  type MeetingId,
  type MeetingIdHistory,
} from "@/lib/schema/meeting";

const STORAGE_KEY = "laoke_meeting_history";
const LEGACY_STORAGE_KEY = "laoke_last_meeting";
const MAX_HISTORY_ITEMS = 10;

function normalizeMeetingHistory(history: MeetingIdHistory): MeetingIdHistory {
  return history
    .filter((item, index, list) => list.findIndex((entry) => entry.meetingId === item.meetingId) === index)
    .sort((a, b) => b.lastJoinedAt - a.lastJoinedAt)
    .slice(0, MAX_HISTORY_ITEMS);
}

function readLegacyMeetingId(): MeetingId | null {
  const result = meetingIdSchema.safeParse(localStorage.getItem(LEGACY_STORAGE_KEY));
  return result.success ? result.data : null;
}

export function getMeetingHistory(): MeetingIdHistory {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const result = meetingIdHistorySchema.safeParse(parsed);
      if (result.success) return normalizeMeetingHistory(result.data);

      const legacyResult = meetingIdSchema.array().safeParse(parsed);
      if (legacyResult.success) {
        const migratedAt = Date.now();
        const migratedHistory = normalizeMeetingHistory(
          legacyResult.data.map((meetingId: MeetingId, index: number) => ({
            meetingId,
            meetingTitle: null,
            lastJoinedAt: migratedAt - index,
          })),
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedHistory));
        localStorage.removeItem(LEGACY_STORAGE_KEY);
        return migratedHistory;
      }
    }

    const legacyMeetingId = readLegacyMeetingId();
    if (!legacyMeetingId) return [];

    const migratedHistory = normalizeMeetingHistory([
      {
        meetingId: legacyMeetingId,
        meetingTitle: null,
        lastJoinedAt: Date.now(),
      },
    ]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedHistory));
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    return migratedHistory;
  } catch {
    return [];
  }
}

export function saveMeetingHistoryItem(item: MeetingHistoryItem): MeetingIdHistory {
  try {
    const result = meetingHistoryItemSchema.safeParse(item);
    if (!result.success) return getMeetingHistory();

    const nextHistory = normalizeMeetingHistory([
      result.data,
      ...getMeetingHistory().filter((entry) => entry.meetingId !== result.data.meetingId),
    ]);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory));
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    return nextHistory;
  } catch {
    return getMeetingHistory();
  }
}

export function saveMeetingHistory(history: MeetingIdHistory): MeetingIdHistory {
  try {
    const result = meetingIdHistorySchema.safeParse(history);
    if (!result.success) return getMeetingHistory();

    const nextHistory = normalizeMeetingHistory(result.data);

    if (nextHistory.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      return [];
    }

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

    const nextHistory = getMeetingHistory().filter((item) => item.meetingId !== result.data);

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
