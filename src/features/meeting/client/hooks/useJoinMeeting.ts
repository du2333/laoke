import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import type { JoinedMeetingHistoryItem } from "@/features/meeting/client/hooks/useMeetingHistory";
import type { MeetingSession } from "@/features/meeting/schema";
import { joinMeetingFn } from "@/features/meeting/server/function";
import type { User } from "@/features/user/client/schema";

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
  const joinMeetingMutation = useMutation({
    mutationFn: async ({ meetingId, currentUser }: { meetingId: string; currentUser: User }) => {
      const data = await joinMeetingFn({
        data: {
          meetingId,
          userId: currentUser.id,
          userName: currentUser.name,
          adminToken: adminToken || undefined,
        },
      });

      return {
        meetingId,
        authToken: data.authToken,
      } satisfies MeetingSession;
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
    } catch (err) {
      if (targetId) {
        onTargetJoinFailed(targetId);
      }
      toast.dismiss(toastId);
      toast.error(err instanceof Error ? err.message : "加入失败");
    }
  }

  return {
    joiningMeeting: joinMeetingMutation.isPending,
    handleJoinMeeting,
  };
}
