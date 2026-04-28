import { ArrowRight, Check, Copy, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { formatCreatedAt } from "@/features/meeting/client/utils/format";
import type { ManagedMeeting, MeetingId } from "@/features/meeting/schema";

type AdminMeetingRowProps = {
  meeting: ManagedMeeting;
  deactivatingMeetingId?: MeetingId;
  onJoinMeeting: (meetingId?: string) => void;
  onRequestDeleteMeeting: (meetingId: MeetingId) => void;
};

export function AdminMeetingRow({
  meeting,
  deactivatingMeetingId,
  onJoinMeeting,
  onRequestDeleteMeeting,
}: AdminMeetingRowProps) {
  const isDeleting = deactivatingMeetingId === meeting.meetingId;

  return (
    <div className="group bg-zinc-950/30 border border-white/10 rounded-2xl p-4 hover:border-white/20 transition-all">
      <div className="flex items-start justify-between gap-3">
        <AdminMeetingDetails meeting={meeting} />
        <AdminMeetingActions
          meetingId={meeting.meetingId}
          isDeleting={isDeleting}
          onJoinMeeting={onJoinMeeting}
          onRequestDeleteMeeting={onRequestDeleteMeeting}
        />
      </div>
    </div>
  );
}

function AdminMeetingDetails({ meeting }: { meeting: ManagedMeeting }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <p className="truncate text-sm font-bold text-zinc-100">
          {meeting.meetingTitle || meeting.meetingId}
        </p>
        {meeting.status ? (
          <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            {meeting.status}
          </span>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
        <span className="font-mono">{meeting.meetingId}</span>
        <span className="opacity-40">•</span>
        <span>{formatCreatedAt(meeting.createdAt)}</span>
      </div>
    </div>
  );
}

type AdminMeetingActionsProps = {
  meetingId: MeetingId;
  isDeleting: boolean;
  onJoinMeeting: (meetingId?: string) => void;
  onRequestDeleteMeeting: (meetingId: MeetingId) => void;
};

function AdminMeetingActions({
  meetingId,
  isDeleting,
  onJoinMeeting,
  onRequestDeleteMeeting,
}: AdminMeetingActionsProps) {
  const [copied, setCopied] = useState(false);

  function handleCopyMeetingId() {
    navigator.clipboard.writeText(meetingId);
    setCopied(true);
    toast.success("已复制会议 ID");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex shrink-0 items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
      <button
        onClick={handleCopyMeetingId}
        className="p-2 text-zinc-500 hover:text-zinc-200 rounded-lg hover:bg-white/5 transition-colors active:scale-95"
        title="复制会议 ID"
      >
        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
      </button>
      <button
        onClick={() => onJoinMeeting(meetingId)}
        className="p-2 text-zinc-500 hover:text-zinc-200 rounded-lg hover:bg-white/5 transition-colors active:scale-95"
        title="加入会议"
      >
        <ArrowRight className="w-4 h-4" />
      </button>
      <button
        onClick={() => onRequestDeleteMeeting(meetingId)}
        disabled={isDeleting}
        className="p-2 text-zinc-500 hover:text-red-300 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-30 disabled:pointer-events-none active:scale-95"
        title="删除会议"
      >
        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      </button>
    </div>
  );
}
