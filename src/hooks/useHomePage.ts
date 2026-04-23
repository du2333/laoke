import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  MeetingHistoryItem,
  MeetingId,
  MeetingMetadata,
  MeetingSession,
} from "@/lib/schema/meeting";
import { meetingMetadataSchema } from "@/lib/schema/meeting";
import type { User } from "@/lib/schema/user";
import { api } from "@/lib/api-client";
import {
  getMeetingHistory,
  removeMeetingId,
  saveMeetingHistory,
  saveMeetingHistoryItem,
} from "@/lib/storage/meeting";

interface UseHomePageOptions {
  user: User | null;
  onSaveUser: (name: string) => User;
  onJoinMeeting: (session: MeetingSession) => void;
}

type RecentMeeting = MeetingHistoryItem & {
  liveParticipants?: number;
  isLive?: boolean;
  metadataLoading: boolean;
};

const meetingMetadataQueryKey = (meetingId: MeetingId) =>
  ["meeting-metadata", meetingId] as const;

export function useHomePage({ user, onSaveUser, onJoinMeeting }: UseHomePageOptions) {
  const queryClient = useQueryClient();
  const [userName, setUserName] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [meetingHistory, setMeetingHistory] = useState<MeetingHistoryItem[]>([]);

  const handleSaveUser = useCallback(() => {
    const name = userName.trim();
    if (!name) return;
    onSaveUser(name);
  }, [onSaveUser, userName]);

  const fetchMeetingMetadata = useCallback(
    async (targetMeetingId: MeetingId): Promise<MeetingMetadata> => {
      const res = await api.api.meeting[":meetingId"].metadata.$get({
        param: { meetingId: targetMeetingId },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error((data as { error?: string }).error || "获取会议信息失败");
      }

      return meetingMetadataSchema.parse(await res.json());
    },
    [],
  );

  useEffect(() => {
    setMeetingHistory(getMeetingHistory());
  }, []);

  const metadataQueries = useQueries({
    queries: meetingHistory.map((item) => ({
      queryKey: meetingMetadataQueryKey(item.meetingId),
      queryFn: () => fetchMeetingMetadata(item.meetingId),
      staleTime: 30_000,
      refetchInterval: 30_000,
    })),
  });

  useEffect(() => {
    const nextHistory = meetingHistory.map((item, index) => {
      const meetingTitle = metadataQueries[index]?.data?.meetingTitle ?? item.meetingTitle ?? null;
      return meetingTitle === (item.meetingTitle ?? null)
        ? item
        : { ...item, meetingTitle };
    });

    const changed = nextHistory.some((item, index) => item !== meetingHistory[index]);
    if (!changed) return;

    setMeetingHistory(saveMeetingHistory(nextHistory));
  }, [meetingHistory, metadataQueries]);

  const recentMeetings = useMemo<RecentMeeting[]>(
    () =>
      meetingHistory.map((item, index) => {
        const metadata = metadataQueries[index]?.data;
        const metadataLoading = !metadata && Boolean(metadataQueries[index]?.isFetching);

        return {
          ...item,
          meetingTitle: metadata?.meetingTitle ?? item.meetingTitle ?? null,
          liveParticipants: metadata?.isLive ? metadata.liveParticipants : undefined,
          isLive: metadata?.isLive,
          metadataLoading,
        };
      }),
    [meetingHistory, metadataQueries],
  );

  const handleJoinMeeting = useCallback(
    async (targetId?: string) => {
      if (!user) return;

      const id = targetId || meetingId.trim();
      if (!id) return;

      setLoading(true);
      const toastId = toast.loading("正在加入频道...");

      try {
        const joinRes = await api.api.join.$post({
          json: {
            meetingId: id,
            userId: user.id,
            userName: user.name,
          },
        });

        if (!joinRes.ok) {
          const data = await joinRes.json();
          if (targetId) {
            setMeetingHistory(removeMeetingId(targetId));
          }
          throw new Error((data as { error?: string }).error || "加入失败");
        }

        const data = await joinRes.json();
        const metadata = await queryClient
          .fetchQuery({
            queryKey: meetingMetadataQueryKey(id),
            queryFn: () => fetchMeetingMetadata(id),
            staleTime: 30_000,
          })
          .catch(() => null);

        setMeetingHistory(
          saveMeetingHistoryItem({
            meetingId: id,
            meetingTitle: metadata?.meetingTitle ?? null,
            lastJoinedAt: Date.now(),
          }),
        );
        toast.dismiss(toastId);
        toast.success(
          metadata?.isLive
            ? `加入成功，当前 ${metadata.liveParticipants} 人在线`
            : "加入成功",
        );
        onJoinMeeting({
          meetingId: id,
          authToken: data.authToken,
        });
      } catch (err) {
        toast.dismiss(toastId);
        toast.error(err instanceof Error ? err.message : "加入失败");
      } finally {
        setLoading(false);
      }
    },
    [fetchMeetingMetadata, meetingId, onJoinMeeting, queryClient, user],
  );

  const handleRemoveMeeting = useCallback((meetingId: MeetingId) => {
    setMeetingHistory(removeMeetingId(meetingId));
    queryClient.removeQueries({ queryKey: meetingMetadataQueryKey(meetingId) });
  }, [queryClient]);

  return {
    userName,
    setUserName,
    meetingId,
    setMeetingId,
    loading,
    meetingHistory: recentMeetings,
    handleSaveUser,
    handleJoinMeeting,
    handleRemoveMeeting,
  };
}
