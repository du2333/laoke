import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { MeetingSession } from "@/lib/schema/meeting";
import type { User } from "@/lib/schema/user";
import { api } from "@/lib/api-client";
import {
  clearLastMeetingId,
  getLastMeetingId,
  saveLastMeetingId,
} from "@/lib/storage/meeting";

interface UseHomePageOptions {
  user: User | null;
  onSaveUser: (name: string) => User;
  onJoinMeeting: (session: MeetingSession) => void;
}

export function useHomePage({ user, onSaveUser, onJoinMeeting }: UseHomePageOptions) {
  const [userName, setUserName] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastMeetingId, setLastMeetingId] = useState<string | null>(null);

  useEffect(() => {
    setLastMeetingId(getLastMeetingId());
  }, []);

  const handleSaveUser = useCallback(() => {
    const name = userName.trim();
    if (!name) return;
    onSaveUser(name);
  }, [onSaveUser, userName]);

  const handleJoinMeeting = useCallback(
    async (targetId?: string) => {
      if (!user) return;

      const id = targetId || meetingId.trim();
      if (!id) return;

      setLoading(true);
      const toastId = toast.loading("正在加入频道...");

      try {
        const res = await api.api.join.$post({
          json: {
            meetingId: id,
            userId: user.id,
            userName: user.name,
          },
        });

        if (!res.ok) {
          const data = await res.json();
          if (targetId) {
            clearLastMeetingId();
            setLastMeetingId(null);
          }
          throw new Error((data as { error?: string }).error || "加入失败");
        }

        const data = await res.json();
        saveLastMeetingId(id);
        setLastMeetingId(id);
        toast.dismiss(toastId);
        toast.success("加入成功");
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
    [meetingId, onJoinMeeting, user],
  );

  const handleClearLastMeeting = useCallback(() => {
    clearLastMeetingId();
    setLastMeetingId(null);
  }, []);

  return {
    userName,
    setUserName,
    meetingId,
    setMeetingId,
    loading,
    lastMeetingId,
    handleSaveUser,
    handleJoinMeeting,
    handleClearLastMeeting,
  };
}
