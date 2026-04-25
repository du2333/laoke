import { useQueries, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import {
  getMeetingHistory,
  removeMeetingId,
  saveMeetingHistoryItem,
  type MeetingHistoryItem,
} from "@/features/meeting/client/storage/meeting-history";
import type { MeetingId } from "@/features/meeting/schema";
import { orpc } from "@/lib/orpc";

type RecentMeeting = MeetingHistoryItem & {
  meetingTitle: string | null;
  liveParticipants?: number;
  metadataLoading: boolean;
};

export type JoinedMeetingHistoryItem = MeetingHistoryItem;

export function useMeetingHistory() {
  const queryClient = useQueryClient();
  const [meetingHistory, setMeetingHistory] = useState<MeetingHistoryItem[]>(getMeetingHistory);

  const metadataQueries = useQueries({
    queries: meetingHistory.map((item) => ({
      ...orpc.meeting.getMeetingMetadata.queryOptions({
        input: { meetingId: item.meetingId },
      }),
      staleTime: 30_000,
    })),
  });

  const recentMeetings: RecentMeeting[] = meetingHistory.map((item, index) => {
    const metadata = metadataQueries[index]?.data;
    const metadataLoading = !metadata && Boolean(metadataQueries[index]?.isFetching);

    return {
      ...item,
      meetingTitle: metadata?.meetingTitle ?? null,
      liveParticipants: metadata?.liveParticipants,
      metadataLoading,
    };
  });

  function saveJoinedMeeting(item: JoinedMeetingHistoryItem) {
    setMeetingHistory(saveMeetingHistoryItem(item));
  }

  function removeMeeting(meetingId: MeetingId) {
    setMeetingHistory(removeMeetingId(meetingId));
    queryClient.removeQueries({
      queryKey: orpc.meeting.getMeetingMetadata.queryKey({
        input: { meetingId },
      }),
    });
  }

  return {
    meetingHistory: recentMeetings,
    saveJoinedMeeting,
    removeMeeting,
  };
}
