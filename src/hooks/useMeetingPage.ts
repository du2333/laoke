import { useEffect, useState } from "react";
import { useRealtimeKitClient } from "@cloudflare/realtimekit-react";
import type { MeetingSession } from "@/lib/schema/meeting";

interface UseMeetingPageOptions {
  session: MeetingSession;
  onLeave: () => void;
}

export function useMeetingPage({ session, onLeave }: UseMeetingPageOptions) {
  const [meeting, initMeeting] = useRealtimeKitClient();
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    initMeeting({
      authToken: session.authToken,
      defaults: {
        audio: true,
        video: false,
      },
    }).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "连接失败");
    });
  }, [session.authToken, initMeeting]);

  useEffect(() => {
    if (!meeting) return;

    const handleLeft = () => {
      onLeave();
    };

    meeting.self.on("roomLeft", handleLeft);
    return () => {
      meeting.self.off("roomLeft", handleLeft);
    };
  }, [meeting, onLeave]);

  return {
    meeting,
    error,
    mounted,
  };
}
