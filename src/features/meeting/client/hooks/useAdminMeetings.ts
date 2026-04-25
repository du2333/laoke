import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import type { MeetingId } from "@/features/meeting/schema";
import { deactivateMeetingFn, listMeetingsFn } from "@/features/meeting/server/function";
import { orpc } from "@/lib/orpc";
import { handleORPCError } from "@/lib/orpc/error-handler";

const ADMIN_TOKEN_STORAGE_KEY = "laoke-admin-token";
const ADMIN_MEETINGS_QUERY_KEY = ["admin-meetings"] as const;
const ADMIN_MEETINGS_PAGE_SIZE = 20;

function getStoredAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) ?? "";
}

export function useAdminMeetings() {
  const queryClient = useQueryClient();
  const [adminToken, setAdminToken] = useState(getStoredAdminToken);
  const [adminTokenInput, setAdminTokenInput] = useState(getStoredAdminToken);
  const [newMeetingTitle, setNewMeetingTitle] = useState("");

  const adminMeetingsQuery = useInfiniteQuery({
    queryKey: ADMIN_MEETINGS_QUERY_KEY,
    queryFn: async ({ pageParam }) => {
      const data = await listMeetingsFn({
        data: { adminToken, pageNo: pageParam, perPage: ADMIN_MEETINGS_PAGE_SIZE },
      });
      return {
        meetings: data.meetings.filter((meeting) => meeting.status === "ACTIVE"),
        nextPageNo: data.nextPageNo,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPageNo,
    enabled: Boolean(adminToken),
    staleTime: 15_000,
  });

  const createMeetingMutation = useMutation(
    orpc.meeting.createMeeting.mutationOptions({
      onSuccess: async () => {
        setNewMeetingTitle("");
        await queryClient.invalidateQueries({ queryKey: ADMIN_MEETINGS_QUERY_KEY });
      },
      onError: (error) => {
        handleORPCError(error, {
          defined: {
            UNAUTHORIZED: () => {
              toast.error("无效的管理员令牌，请重新输入");
              handleClearAdminToken();
            },
          },
          fallback: (error) => {
            toast.error(error instanceof Error ? error.message : "创建会议失败");
          },
        });
      },
    }),
  );

  const deactivateMeetingMutation = useMutation({
    mutationFn: async (targetMeetingId: MeetingId) => {
      return deactivateMeetingFn({ data: { meetingId: targetMeetingId, adminToken } });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ADMIN_MEETINGS_QUERY_KEY });
    },
  });

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
    queryClient.removeQueries({ queryKey: ADMIN_MEETINGS_QUERY_KEY });
  }

  async function handleLoadMoreMeetings() {
    await adminMeetingsQuery.fetchNextPage();
  }

  async function handleCreateMeeting() {
    const title = newMeetingTitle.trim();
    if (!title) return;

    createMeetingMutation.mutate({ title, adminToken });
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
    adminToken,
    adminTokenInput,
    setAdminTokenInput,
    newMeetingTitle,
    setNewMeetingTitle,
    adminMeetings: adminMeetingsQuery.data?.pages.flatMap((page) => page.meetings) ?? [],
    adminMeetingsLoading: adminMeetingsQuery.isFetching,
    adminMeetingsError: adminMeetingsQuery.error,
    adminMeetingsHasMore: adminMeetingsQuery.hasNextPage,
    adminMeetingsLoadingMore: adminMeetingsQuery.isFetchingNextPage,
    creatingMeeting: createMeetingMutation.isPending,
    deactivatingMeetingId: deactivateMeetingMutation.isPending
      ? deactivateMeetingMutation.variables
      : undefined,
    handleSaveAdminToken,
    handleClearAdminToken,
    handleCreateMeeting,
    handleDeactivateMeeting,
    handleLoadMoreMeetings,
  };
}
