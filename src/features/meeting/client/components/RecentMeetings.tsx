import { ArrowRight, History, Loader2, X } from "lucide-react";

import type { MeetingHistoryItem } from "@/features/meeting/client/storage/meeting-history";
import { formatLastJoinedAt } from "@/features/meeting/client/utils/format";
import type { MeetingId } from "@/features/meeting/schema";

type RecentMeeting = MeetingHistoryItem & {
  meetingTitle: string | null;
  liveParticipants?: number;
  metadataLoading: boolean;
};

type RecentMeetingsProps = {
  meetings: Array<RecentMeeting>;
  onJoinMeeting: (meetingId?: string) => void;
  onRemoveMeeting: (meetingId: MeetingId) => void;
};

export function RecentMeetings({ meetings, onJoinMeeting, onRemoveMeeting }: RecentMeetingsProps) {
  if (meetings.length === 0) return null;

  return (
    <div className="pt-4 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex items-center justify-between mb-4 px-1">
        <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
          近期会议
        </label>
        <div className="h-px flex-1 bg-white/10 mx-4" />
      </div>
      <div className="grid gap-3">
        {meetings.map((meeting) => (
          <div
            key={meeting.meetingId}
            className="group relative bg-zinc-900/50 border border-white/10 rounded-2xl p-4 hover:bg-zinc-900/70 hover:border-white/20 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center text-zinc-400 group-hover:text-blue-400 transition-colors border border-white/10 shadow-sm">
                <History className="w-4 h-4" />
              </div>
              <div
                className="min-w-0 flex-1 cursor-pointer"
                onClick={() => onJoinMeeting(meeting.meetingId)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base font-bold text-zinc-100 group-hover:text-white transition-colors truncate">
                    {meeting.meetingTitle || meeting.meetingId}
                  </span>
                  {meeting.metadataLoading ? (
                    <Loader2 className="w-3 h-3 text-zinc-500 animate-spin" />
                  ) : meeting.liveParticipants ? (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                        {meeting.liveParticipants} 在线
                      </span>
                    </div>
                  ) : null}
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                  <span className="font-mono opacity-80">{meeting.meetingId.slice(0, 8)}...</span>
                  <span className="opacity-40">•</span>
                  <span>{formatLastJoinedAt(meeting.lastJoinedAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={() => onRemoveMeeting(meeting.meetingId)}
                  className="p-2 text-zinc-600 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5"
                  title="移除"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onJoinMeeting(meeting.meetingId)}
                  className="p-2 text-zinc-400 hover:text-white transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
