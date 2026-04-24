import { createClientOnlyFn } from "@tanstack/react-start";
import { z } from "zod";

import { meetingIdSchema, type MeetingId } from "@/features/meeting/schema";

const meetingHistoryItemSchema = z.object({
  meetingId: meetingIdSchema,
  lastJoinedAt: z.number(),
});

const meetingIdHistorySchema = z.array(meetingHistoryItemSchema);

export type MeetingHistoryItem = z.infer<typeof meetingHistoryItemSchema>;
export type MeetingIdHistory = z.infer<typeof meetingIdHistorySchema>;

const STORAGE_KEY = "laoke_meeting_history";
const MAX_HISTORY_ITEMS = 10;

function normalizeMeetingHistory(history: MeetingIdHistory): MeetingIdHistory {
  return history
    .filter(
      (item, index, list) =>
        list.findIndex((entry) => entry.meetingId === item.meetingId) === index,
    )
    .sort((a, b) => b.lastJoinedAt - a.lastJoinedAt)
    .slice(0, MAX_HISTORY_ITEMS);
}

export const getMeetingHistory = createClientOnlyFn((): MeetingIdHistory => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const result = meetingIdHistorySchema.safeParse(JSON.parse(stored));
    return result.success ? normalizeMeetingHistory(result.data) : [];
  } catch {
    return [];
  }
});

export const saveMeetingHistoryItem = createClientOnlyFn(
  (item: MeetingHistoryItem): MeetingIdHistory => {
    try {
      const result = meetingHistoryItemSchema.safeParse(item);
      if (!result.success) return getMeetingHistory();

      const nextHistory = normalizeMeetingHistory([
        result.data,
        ...getMeetingHistory().filter((entry) => entry.meetingId !== result.data.meetingId),
      ]);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory));
      return nextHistory;
    } catch {
      return getMeetingHistory();
    }
  },
);

export const removeMeetingId = createClientOnlyFn((meetingId: MeetingId): MeetingIdHistory => {
  try {
    const result = meetingIdSchema.safeParse(meetingId);
    if (!result.success) return getMeetingHistory();

    const nextHistory = getMeetingHistory().filter((item) => item.meetingId !== result.data);

    if (nextHistory.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory));
    return nextHistory;
  } catch {
    return getMeetingHistory();
  }
});

export const clearMeetingHistory = createClientOnlyFn((): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
});
