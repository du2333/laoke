import { ArrowRight, Hash, Loader2 } from "lucide-react";

type JoinMeetingPanelProps = {
  meetingId: string;
  setMeetingId: (value: string) => void;
  loading: boolean;
  onJoinMeeting: (meetingId?: string) => void;
};

export function JoinMeetingPanel({
  meetingId,
  setMeetingId,
  loading,
  onJoinMeeting,
}: JoinMeetingPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
          加入会议
        </label>
      </div>
      <div className="relative group">
        <div className="absolute top-1/2 -translate-y-1/2 left-4 text-zinc-500 group-focus-within:text-blue-400 transition-colors">
          <Hash className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={meetingId}
          onChange={(event) => setMeetingId(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && onJoinMeeting()}
          placeholder="输入或粘贴会议 ID"
          className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-14 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-medium"
          disabled={loading}
        />
        <div className="absolute top-1/2 -translate-y-1/2 right-2">
          <button
            onClick={() => onJoinMeeting()}
            disabled={!meetingId.trim() || loading}
            className="flex items-center justify-center w-10 h-10 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl disabled:opacity-0 disabled:pointer-events-none transition-all duration-300"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
