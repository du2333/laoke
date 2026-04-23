import { useEffect, useState } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  MeetingHistoryItem,
  MeetingId,
  MeetingMetadata,
  MeetingSession,
} from "@/lib/schema/meeting";
import { managedMeetingListSchema, meetingMetadataSchema } from "@/lib/schema/meeting";
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

const ADMIN_TOKEN_STORAGE_KEY = "laoke-admin-token";

export function useHomePage({ user, onSaveUser, onJoinMeeting }: UseHomePageOptions) {
  const queryClient = useQueryClient();
  const [userName, setUserName] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const [newMeetingTitle, setNewMeetingTitle] = useState("");
  const [adminToken, setAdminToken] = useState("");
  const [adminTokenInput, setAdminTokenInput] = useState("");
  const [meetingHistory, setMeetingHistory] = useState<MeetingHistoryItem[]>([]);
  const [isEditingName, setIsEditingName] = useState(false);

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
    const savedAdminToken = localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) ?? "";
    setAdminToken(savedAdminToken);
    setAdminTokenInput(savedAdminToken);
  }, []);

  const adminMeetingsQuery = useQuery({
    queryKey: ["admin-meetings", adminToken],
    queryFn: async () => {
      const res = await api.api.admin.meetings.$get(undefined, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error((data as { error?: string }).error || "获取会议列表失败");
      }

      return managedMeetingListSchema
        .parse(await res.json())
        .meetings.filter((meeting) => meeting.status === "ACTIVE");
    },
    enabled: Boolean(adminToken),
    staleTime: 15_000,
  });

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

  const createMeetingMutation = useMutation({
    mutationFn: async (title: string) => {
      const res = await api.api.admin.meetings.$post(
        { json: { title } },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error((data as { error?: string }).error || "创建会议失败");
      }

      return res.json();
    },
    onSuccess: async () => {
      setNewMeetingTitle("");
      await adminMeetingsQuery.refetch();
    },
  });

  const deactivateMeetingMutation = useMutation({
    mutationFn: async (targetMeetingId: MeetingId) => {
      const res = await api.api.admin.meetings[":meetingId"].deactivate.$patch(
        { param: { meetingId: targetMeetingId } },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error((data as { error?: string }).error || "删除会议失败");
      }

      return res.json();
    },
    onSuccess: async () => {
      await adminMeetingsQuery.refetch();
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

  function handleSaveAdminToken() {
    const token = adminTokenInput.trim();
    if (!token) return;

    localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
    setAdminToken(token);
    toast.success("已进入管理模式");
  }

  function handleClearAdminToken() {
    localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    setAdminToken("");
    setAdminTokenInput("");
    queryClient.removeQueries({ queryKey: ["admin-meetings"] });
  }

  async function handleCreateMeeting() {
    const title = newMeetingTitle.trim();
    if (!title) return;

    try {
      await createMeetingMutation.mutateAsync(title);
      toast.success("会议已创建");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "创建会议失败");
    }
  }

  async function handleDeactivateMeeting(targetMeetingId: MeetingId) {
    try {
      await deactivateMeetingMutation.mutateAsync(targetMeetingId);
      toast.success("会议已删除");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "删除会议失败");
    }
  }

  return {
    userName,
    setUserName,
    meetingId,
    setMeetingId,
    newMeetingTitle,
    setNewMeetingTitle,
    adminToken,
    adminTokenInput,
    setAdminTokenInput,
    isEditingName,
    setIsEditingName,
    loading: joinMeetingMutation.isPending,
    adminMeetings: adminMeetingsQuery.data ?? [],
    adminMeetingsLoading: adminMeetingsQuery.isFetching,
    adminMeetingsError: adminMeetingsQuery.error,
    creatingMeeting: createMeetingMutation.isPending,
    deactivatingMeetingId: deactivateMeetingMutation.isPending
      ? deactivateMeetingMutation.variables
      : undefined,
    meetingHistory: recentMeetings,
    handleSaveUser,
    handleSaveAdminToken,
    handleClearAdminToken,
    handleCreateMeeting,
    handleDeactivateMeeting,
    handleJoinMeeting,
    handleRemoveMeeting,
  };
}
