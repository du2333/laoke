import { useEffect, useState } from "react";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
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
  const [meetingHistory, setMeetingHistory] = useState<MeetingHistoryItem[]>([]);

  function handleSaveUser() {
    const name = userName.trim();
    if (!name) return;
    onSaveUser(name);
  }

  async function fetchMeetingMetadata(targetMeetingId: MeetingId): Promise<MeetingMetadata> {
    const res = await api.api.meeting[":meetingId"].metadata.$get({
      param: { meetingId: targetMeetingId },
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error((data as { error?: string }).error || "获取会议信息失败");
    }

    return meetingMetadataSchema.parse(await res.json());
  }

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

  const recentMeetings: RecentMeeting[] = meetingHistory.map((item, index) => {
    const metadata = metadataQueries[index]?.data;
    const metadataLoading = !metadata && Boolean(metadataQueries[index]?.isFetching);

    return {
      ...item,
      meetingTitle: metadata?.meetingTitle ?? item.meetingTitle ?? null,
      liveParticipants: metadata?.isLive ? metadata.liveParticipants : undefined,
      isLive: metadata?.isLive,
      metadataLoading,
    };
  });

  const joinMeetingMutation = useMutation({
    mutationFn: async ({
      meetingId,
      currentUser,
    }: {
      meetingId: string;
      currentUser: User;
    }) => {
      const joinRes = await api.api.join.$post({
        json: {
          meetingId,
          userId: currentUser.id,
          userName: currentUser.name,
        },
      });

      if (!joinRes.ok) {
        const data = await joinRes.json();
        throw new Error((data as { error?: string }).error || "加入失败");
      }

      const data = await joinRes.json();
      const metadata = await queryClient
        .fetchQuery({
          queryKey: meetingMetadataQueryKey(meetingId),
          queryFn: () => fetchMeetingMetadata(meetingId),
          staleTime: 30_000,
        })
        .catch(() => null);

      return {
        meetingId,
        authToken: data.authToken,
        metadata,
      };
    },
  });

  async function handleJoinMeeting(targetId?: string) {
    if (!user) return;

    const id = targetId || meetingId.trim();
    if (!id) return;

    const toastId = toast.loading("正在加入频道...");

    try {
      const result = await joinMeetingMutation.mutateAsync({
        meetingId: id,
        currentUser: user,
      });

      setMeetingHistory(
        saveMeetingHistoryItem({
          meetingId: id,
          meetingTitle: result.metadata?.meetingTitle ?? null,
          lastJoinedAt: Date.now(),
        }),
      );
      toast.dismiss(toastId);
      toast.success(
        result.metadata?.isLive
          ? `加入成功，当前 ${result.metadata.liveParticipants} 人在线`
          : "加入成功",
      );
      onJoinMeeting({
        meetingId: id,
        authToken: result.authToken,
      });
    } catch (err) {
      if (targetId) {
        setMeetingHistory(removeMeetingId(targetId));
      }
      toast.dismiss(toastId);
      toast.error(err instanceof Error ? err.message : "加入失败");
    }
  }

  function handleRemoveMeeting(meetingId: MeetingId) {
    setMeetingHistory(removeMeetingId(meetingId));
    queryClient.removeQueries({ queryKey: meetingMetadataQueryKey(meetingId) });
  }

  return {
    userName,
    setUserName,
    meetingId,
    setMeetingId,
    loading: joinMeetingMutation.isPending,
    meetingHistory: recentMeetings,
    handleSaveUser,
    handleJoinMeeting,
    handleRemoveMeeting,
  };
}
