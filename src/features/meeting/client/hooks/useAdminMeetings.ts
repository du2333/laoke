import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import type { MeetingId } from "@/features/meeting/schema";
import { orpc } from "@/lib/orpc";
import { handleORPCError } from "@/lib/orpc/error-handler";

const ADMIN_TOKEN_STORAGE_KEY = "laoke-admin-token";
const ADMIN_MEETINGS_PAGE_SIZE = 20;

function getStoredAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) ?? "";
}

export function useAdminMeetings() {
  const queryClient = useQueryClient();
  const [adminToken, setAdminToken] = useState(getStoredAdminToken);
  const [adminTokenInput, setAdminTokenInput] = useState(getStoredAdminToken);
  const [newMeetingTitle, setNewMeetingTitle] = useState("");

  const adminMeetingsQuery = useInfiniteQuery(
    orpc.meeting.listMeetings.infiniteOptions({
      input: (pageParam: number) => ({
        adminToken,
        pageNo: pageParam,
        perPage: ADMIN_MEETINGS_PAGE_SIZE,
      }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => lastPage.nextPageNo ?? undefined,
      enabled: Boolean(adminToken),
      staleTime: 15_000,
    }),
  );

  const createMeetingMutation = useMutation(
    orpc.meeting.createMeeting.mutationOptions({
      onSuccess: async () => {
        setNewMeetingTitle("");
        await queryClient.invalidateQueries({ queryKey: orpc.meeting.listMeetings.key() });
        toast.success("会议已创建");
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

  const deactivateMeetingMutation = useMutation(
    orpc.meeting.deactivateMeeting.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: orpc.meeting.listMeetings.key() });
        toast.success("会议已删除");
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
            toast.error(error instanceof Error ? error.message : "删除会议失败");
          },
        });
      },
    }),
  );

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
    queryClient.removeQueries({ queryKey: orpc.meeting.listMeetings.key() });
  }

  async function handleLoadMoreMeetings() {
    await adminMeetingsQuery.fetchNextPage();
  }

  async function handleCreateMeeting() {
    const title = newMeetingTitle.trim();
    if (!title) return;

    createMeetingMutation.mutate({ title, adminToken });
  }

  function handleDeactivateMeeting(targetMeetingId: MeetingId) {
    deactivateMeetingMutation.mutate({ meetingId: targetMeetingId, adminToken });
  }

  return {
    adminToken,
    adminTokenInput,
    setAdminTokenInput,
    newMeetingTitle,
    setNewMeetingTitle,
    adminMeetings:
      adminMeetingsQuery.data?.pages.flatMap((page) =>
        page.meetings.filter((meeting) => meeting.status === "ACTIVE"),
      ) ?? [],
    adminMeetingsLoading: adminMeetingsQuery.isFetching,
    adminMeetingsError: adminMeetingsQuery.error,
    adminMeetingsHasMore: adminMeetingsQuery.hasNextPage,
    adminMeetingsLoadingMore: adminMeetingsQuery.isFetchingNextPage,
    creatingMeeting: createMeetingMutation.isPending,
    deactivatingMeetingId: deactivateMeetingMutation.isPending
      ? deactivateMeetingMutation.variables?.meetingId
      : undefined,
    handleSaveAdminToken,
    handleClearAdminToken,
    handleCreateMeeting,
    handleDeactivateMeeting,
    handleLoadMoreMeetings,
  };
}
