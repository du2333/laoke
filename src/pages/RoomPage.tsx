import { useEffect, useState } from "react";
import { useRealtimeKitClient } from "@cloudflare/realtimekit-react";
import { RtkMeeting } from "@cloudflare/realtimekit-react-ui";
import type { RoomSession } from "../types";

interface RoomPageProps {
  session: RoomSession;
  onLeave: () => void;
}

export function RoomPage({ session, onLeave }: RoomPageProps) {
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
      {/* Room code overlay */}
      <div className="absolute top-4 left-4 z-50 flex items-center gap-2 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2">
        <span className="text-white text-sm">房间号:</span>
        <span className="text-white font-mono font-bold tracking-wider">
          {session.room.id}
        </span>
        <button
          onClick={() => navigator.clipboard.writeText(session.room.id)}
          className="ml-1 text-slate-300 hover:text-white transition-colors"
          title="复制房间号"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {/* Meeting area */}
      <RtkMeeting meeting={meeting} />
    </div>
  );
}
