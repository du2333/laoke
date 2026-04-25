import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import type { JoinedMeetingHistoryItem } from "@/features/meeting/client/hooks/useMeetingHistory";
import type { MeetingSession } from "@/features/meeting/schema";
import type { User } from "@/features/user/client/schema";
import { orpc } from "@/lib/orpc";
import { handleORPCError } from "@/lib/orpc/error-handler";

type UseJoinMeetingOptions = {
  user: User | null;
  meetingId: string;
  adminToken: string;
  onJoinMeeting: (session: MeetingSession) => void;
  onMeetingJoined: (item: JoinedMeetingHistoryItem) => void;
  onTargetJoinFailed: (meetingId: string) => void;
};

export function useJoinMeeting({
  user,
  meetingId,
  adminToken,
  onJoinMeeting,
  onMeetingJoined,
  onTargetJoinFailed,
}: UseJoinMeetingOptions) {
  const joinMeetingMutation = useMutation(orpc.meeting.joinMeeting.mutationOptions());

  function handleJoinMeeting(targetId?: string) {
    if (!user) return;

    const id = targetId || meetingId.trim();
    if (!id) return;

    const toastId = toast.loading("正在加入频道...");

    joinMeetingMutation.mutate(
      {
        meetingId: id,
        userId: user.id,
        userName: user.name,
        adminToken: adminToken || undefined,
      },
      {
        onSuccess: (result) => {
          onMeetingJoined({
            meetingId: id,
            lastJoinedAt: Date.now(),
          });
          toast.dismiss(toastId);
          toast.success("加入成功");
          onJoinMeeting({
            meetingId: id,
            authToken: result.authToken,
          });
        },
        onError: (error) => {
          if (targetId) {
            onTargetJoinFailed(targetId);
          }
          toast.dismiss(toastId);
          handleORPCError(error, {
            defined: {
              UNAUTHORIZED: () => {
                toast.error("无效的管理员令牌，请重新输入");
              },
            },
            fallback: (error) => {
              toast.error(error instanceof Error ? error.message : "加入失败");
            },
          });
        },
      },
    );
  }

  return {
    joiningMeeting: joinMeetingMutation.isPending,
    handleJoinMeeting,
  };
}
