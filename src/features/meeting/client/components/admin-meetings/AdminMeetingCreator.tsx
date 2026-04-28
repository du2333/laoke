import { Loader2, Plus } from "lucide-react";

type AdminMeetingCreatorProps = {
  newMeetingTitle: string;
  setNewMeetingTitle: (value: string) => void;
  creatingMeeting: boolean;
  onCreateMeeting: () => void;
};

export function AdminMeetingCreator({
  newMeetingTitle,
  setNewMeetingTitle,
  creatingMeeting,
  onCreateMeeting,
}: AdminMeetingCreatorProps) {
  return (
    <div className="relative group">
      <input
        type="text"
        value={newMeetingTitle}
        onChange={(event) => setNewMeetingTitle(event.target.value)}
        onKeyDown={(event) => event.key === "Enter" && onCreateMeeting()}
        placeholder="新会议标题"
        className="w-full bg-zinc-950/40 border border-white/10 rounded-2xl py-4 pl-4 pr-14 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-medium"
        maxLength={80}
        disabled={creatingMeeting}
        autoFocus
      />
      <div className="absolute top-1/2 -translate-y-1/2 right-2">
        <button
          onClick={onCreateMeeting}
          disabled={!newMeetingTitle.trim() || creatingMeeting}
          className="flex items-center justify-center w-10 h-10 bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 rounded-xl disabled:opacity-0 disabled:pointer-events-none transition-all duration-300 active:scale-95"
          title="创建会议"
        >
          {creatingMeeting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
