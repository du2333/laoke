import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import {
  clearAdminPassword,
  getAdminPassword,
  saveAdminPassword,
} from "@/features/auth/client/storage/admin-password";
import type { MeetingId } from "@/features/meeting/schema";
import { orpc } from "@/lib/orpc";
import { handleORPCError } from "@/lib/orpc/error-handler";

const ADMIN_MEETINGS_PAGE_SIZE = 20;

export function useAdminMeetings() {
  const queryClient = useQueryClient();
  const [adminPassword, setAdminPassword] = useState(getAdminPassword);
  const [adminPasswordInput, setAdminPasswordInput] = useState(getAdminPassword);
  const [newMeetingTitle, setNewMeetingTitle] = useState("");

  const adminMeetingsQuery = useInfiniteQuery(
    orpc.meeting.listMeetings.infiniteOptions({
      input: (pageParam: number) => ({
        pageNo: pageParam,
        perPage: ADMIN_MEETINGS_PAGE_SIZE,
      }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => lastPage.nextPageNo ?? undefined,
      enabled: Boolean(adminPassword),
      staleTime: 15_000,
    }),
  );

  const verifyAdminPasswordMutation = useMutation(
    orpc.auth.verifyAdminPassword.mutationOptions({
      onSuccess: (_data, input) => {
        saveAdminPassword(input.adminPassword);
        setAdminPassword(input.adminPassword);
        toast.success("已进入管理模式");
      },
      onError: (error) => {
        handleORPCError(error, {
          defined: {
            UNAUTHORIZED: () => {
              toast.error("管理密码不正确");
            },
          },
          fallback: (error) => {
            toast.error(error instanceof Error ? error.message : "验证管理密码失败");
          },
        });
      },
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
              toast.error("管理密码已失效，请重新输入");
              handleClearAdminPassword();
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
              toast.error("管理密码已失效，请重新输入");
              handleClearAdminPassword();
            },
          },
          fallback: (error) => {
            toast.error(error instanceof Error ? error.message : "删除会议失败");
          },
        });
      },
    }),
  );

  function handleSaveAdminPassword() {
    const adminPassword = adminPasswordInput.trim();
    if (!adminPassword) return;

    verifyAdminPasswordMutation.mutate({ adminPassword });
  }

  function handleClearAdminPassword() {
    clearAdminPassword();
    setAdminPassword("");
    setAdminPasswordInput("");
    queryClient.removeQueries({ queryKey: orpc.meeting.listMeetings.key() });
  }

  async function handleLoadMoreMeetings() {
    await adminMeetingsQuery.fetchNextPage();
  }

  async function handleCreateMeeting() {
    const title = newMeetingTitle.trim();
    if (!title) return;

    createMeetingMutation.mutate({ title });
  }

  function handleDeactivateMeeting(targetMeetingId: MeetingId) {
    deactivateMeetingMutation.mutate({ meetingId: targetMeetingId });
  }

  return {
    adminPassword,
    adminPasswordInput,
    setAdminPasswordInput,
    verifyingAdminPassword: verifyAdminPasswordMutation.isPending,
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
    handleSaveAdminPassword,
    handleClearAdminPassword,
    handleCreateMeeting,
    handleDeactivateMeeting,
    handleLoadMoreMeetings,
  };
}
