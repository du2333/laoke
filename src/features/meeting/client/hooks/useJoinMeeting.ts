import { useMutation } from "@tanstack/react-query";
import { useRef } from "react";
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
  const targetJoinRef = useRef<string | undefined>(undefined);
  const joinMeetingMutation = useMutation(
    orpc.meeting.joinMeeting.mutationOptions({
      onSuccess: (result, input) => {
        targetJoinRef.current = undefined;
        onMeetingJoined({
          meetingId: input.meetingId,
          lastJoinedAt: Date.now(),
        });
        onJoinMeeting({
          meetingId: input.meetingId,
          authToken: result.authToken,
        });
      },
      onError: (error) => {
        if (targetJoinRef.current) {
          onTargetJoinFailed(targetJoinRef.current);
        }
        targetJoinRef.current = undefined;
        handleORPCError(error, {
          defined: {
            UNAUTHORIZED: () => {},
          },
          fallback: (error) => {
            console.error("Join meeting error:", error);
            toast.error("加入会议失败，请稍后再试");
          },
        });
      },
    }),
  );

  function handleJoinMeeting(targetId?: string) {
    if (!user) return;

    const id = targetId || meetingId.trim();
    if (!id) return;

    targetJoinRef.current = targetId;
    joinMeetingMutation.mutate({
      meetingId: id,
      userId: user.id,
      userName: user.name,
      adminToken: adminToken || undefined,
    });
  }

  return {
    joiningMeeting: joinMeetingMutation.isPending,
    handleJoinMeeting,
  };
}
