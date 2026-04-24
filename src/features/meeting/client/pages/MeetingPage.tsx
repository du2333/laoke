import { RtkMeeting } from "@cloudflare/realtimekit-react-ui";
import { Wifi } from "lucide-react";

import { useMeetingPage } from "@/features/meeting/client/hooks/useMeetingPage";
import type { MeetingSession } from "@/features/meeting/schema";

interface MeetingPageProps {
  session: MeetingSession;
  onLeave: () => void;
}

export function MeetingPage({ session, onLeave }: MeetingPageProps) {
  const { meeting, error } = useMeetingPage({ session, onLeave });

  // --- ERROR STATE ---
  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 text-red-500">
            <Wifi className="w-6 h-6" />
          </div>
          <p className="text-zinc-500 font-mono text-sm">{error}</p>
          <button
            onClick={onLeave}
            className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-full text-white text-sm transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  // --- LOADING STATE ---
  if (!meeting) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          <p className="text-zinc-600 font-mono text-xs tracking-widest uppercase">正在连接中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen relative bg-zinc-950 overflow-hidden">
      {/* Main Video Area: Cloudflare RealtimeKit Default UI */}
      <main className="w-full h-full [&_.rtk-layout]:bg-transparent [&_.rtk-grid]:gap-2 [&_.rtk-grid]:p-4 [&_.rtk-video-tile]:rounded-2xl [&_.rtk-video-tile]:overflow-hidden [&_.rtk-video-tile]:border [&_.rtk-video-tile]:border-white/5 [&_.rtk-video-tile]:shadow-2xl">
        <RtkMeeting meeting={meeting} />
      </main>
    </div>
  );
}
