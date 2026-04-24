import { ArrowRight, Copy, KeyRound, Loader2, Plus, Shield, Trash2, X } from "lucide-react";

import { formatCreatedAt } from "@/features/meeting/client/utils/format";
import type { ManagedMeeting, MeetingId } from "@/features/meeting/schema";

type AdminMeetingsPanelProps = {
  adminToken: string;
  adminTokenInput: string;
  setAdminTokenInput: (value: string) => void;
  newMeetingTitle: string;
  setNewMeetingTitle: (value: string) => void;
  adminMeetings: Array<ManagedMeeting>;
  adminMeetingsLoading: boolean;
  adminMeetingsError: Error | null;
  adminMeetingsHasMore: boolean;
  adminMeetingsLoadingMore: boolean;
  creatingMeeting: boolean;
  deactivatingMeetingId?: MeetingId;
  onSaveAdminToken: () => void;
  onClearAdminToken: () => void;
  onCreateMeeting: () => void;
  onDeactivateMeeting: (meetingId: MeetingId) => void;
  onLoadMoreMeetings: () => void;
  onJoinMeeting: (meetingId?: string) => void;
};

export function AdminMeetingsPanel({
  adminToken,
  adminTokenInput,
  setAdminTokenInput,
  newMeetingTitle,
  setNewMeetingTitle,
  adminMeetings,
  adminMeetingsLoading,
  adminMeetingsError,
  adminMeetingsHasMore,
  adminMeetingsLoadingMore,
  creatingMeeting,
  deactivatingMeetingId,
  onSaveAdminToken,
  onClearAdminToken,
  onCreateMeeting,
  onDeactivateMeeting,
  onLoadMoreMeetings,
  onJoinMeeting,
}: AdminMeetingsPanelProps) {
  return (
    <div className="bg-zinc-900/40 border border-white/10 rounded-2xl p-5 shadow-sm backdrop-blur-md min-h-90">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
            <Shield className="w-4 h-4" />
            管理会议
          </div>
          <p className="mt-2 text-sm text-zinc-500">创建会议、复制 ID、删除不用的会议</p>
        </div>
        {adminToken && (
          <button
            onClick={onClearAdminToken}
            className="shrink-0 p-2 text-zinc-500 hover:text-zinc-200 rounded-lg hover:bg-white/5 transition-colors"
            title="退出管理"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {!adminToken ? (
        <div className="space-y-4">
          <div className="relative group">
            <div className="absolute top-1/2 -translate-y-1/2 left-4 text-zinc-500 group-focus-within:text-blue-400 transition-colors">
              <KeyRound className="w-4 h-4" />
            </div>
            <input
              type="password"
              value={adminTokenInput}
              onChange={(event) => setAdminTokenInput(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && onSaveAdminToken()}
              placeholder="输入管理密码"
              className="w-full bg-zinc-950/40 border border-white/10 rounded-2xl py-4 pl-12 pr-14 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-medium"
            />
            <div className="absolute top-1/2 -translate-y-1/2 right-2">
              <button
                onClick={onSaveAdminToken}
                disabled={!adminTokenInput.trim()}
                className="flex items-center justify-center w-10 h-10 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl disabled:opacity-0 disabled:pointer-events-none transition-all duration-300"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
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
            />
            <div className="absolute top-1/2 -translate-y-1/2 right-2">
              <button
                onClick={onCreateMeeting}
                disabled={!newMeetingTitle.trim() || creatingMeeting}
                className="flex items-center justify-center w-10 h-10 bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 rounded-xl disabled:opacity-0 disabled:pointer-events-none transition-all duration-300"
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

          {adminMeetingsError ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {adminMeetingsError.message}
            </div>
          ) : null}

          <div className="grid gap-3 max-h-107.5 overflow-y-auto pr-1">
            {adminMeetingsLoading && adminMeetings.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-zinc-500">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : adminMeetings.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-zinc-950/30 px-4 py-8 text-center text-sm text-zinc-500">
                还没有会议
              </div>
            ) : (
              adminMeetings.map((meeting) => (
                <div
                  key={meeting.meetingId}
                  className="group bg-zinc-950/30 border border-white/10 rounded-2xl p-4 hover:border-white/20 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
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
                    <div className="flex shrink-0 items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => navigator.clipboard.writeText(meeting.meetingId)}
                        className="p-2 text-zinc-500 hover:text-zinc-200 rounded-lg hover:bg-white/5 transition-colors"
                        title="复制会议 ID"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onJoinMeeting(meeting.meetingId)}
                        className="p-2 text-zinc-500 hover:text-zinc-200 rounded-lg hover:bg-white/5 transition-colors"
                        title="加入会议"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeactivateMeeting(meeting.meetingId)}
                        disabled={deactivatingMeetingId === meeting.meetingId}
                        className="p-2 text-zinc-500 hover:text-red-300 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                        title="删除会议"
                      >
                        {deactivatingMeetingId === meeting.meetingId ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}

            {adminMeetingsHasMore ? (
              <button
                onClick={onLoadMoreMeetings}
                disabled={adminMeetingsLoadingMore}
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-zinc-950/30 px-4 py-3 text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:border-white/20 transition-colors disabled:opacity-50"
              >
                {adminMeetingsLoadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                加载更多
              </button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
