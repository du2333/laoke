import { useEffect, useState } from "react";
import { useRealtimeKitClient } from "@cloudflare/realtimekit-react";
import { RtkMeeting } from "@cloudflare/realtimekit-react-ui";
import type { MeetingSession } from "../types";

interface MeetingPageProps {
  session: MeetingSession;
  onLeave: () => void;
}

export function MeetingPage({ session, onLeave }: MeetingPageProps) {
  const [meeting, initMeeting] = useRealtimeKitClient();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

  // Handle meeting end
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

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-md text-center">
          <h2 className="text-xl font-bold text-red-400 mb-4">出错了</h2>
          <p className="text-slate-300 mb-6">{error}</p>
          <button
            onClick={onLeave}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">连接中...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen relative">
      <RtkMeeting meeting={meeting} />
    </div>
  );
}
