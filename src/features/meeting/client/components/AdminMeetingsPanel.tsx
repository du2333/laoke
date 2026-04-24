import {
  ArrowRight,
  Copy,
  KeyRound,
  Loader2,
  Plus,
  Shield,
  Trash2,
  X,
  Inbox,
  Check,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
  onClose: () => void;
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
  onClose,
}: AdminMeetingsPanelProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [meetingToDelete, setMeetingToDelete] = useState<MeetingId | null>(null);

  return (
    <>
      <div className="bg-zinc-900/90 border border-white/10 rounded-2xl p-5 shadow-2xl backdrop-blur-xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-4 mb-5 shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
              <Shield className="w-4 h-4" />
              管理会议
            </div>
            <p className="mt-2 text-sm text-zinc-500">创建会议、复制 ID、删除不用的会议</p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-2 text-zinc-500 hover:text-zinc-200 rounded-lg hover:bg-white/5 transition-colors"
            title="关闭面板"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
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
                  autoFocus
                />
                <div className="absolute top-1/2 -translate-y-1/2 right-2">
                  <button
                    onClick={onSaveAdminToken}
                    disabled={!adminTokenInput.trim()}
                    className="flex items-center justify-center w-10 h-10 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl disabled:opacity-0 disabled:pointer-events-none transition-all duration-300 active:scale-95"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5 pb-4">
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

              {adminMeetingsError ? (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {adminMeetingsError.message}
                </div>
              ) : null}

              <div className="grid gap-3">
                {adminMeetingsLoading && adminMeetings.length === 0 ? (
                  <div className="flex items-center justify-center py-12 text-zinc-500">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                ) : adminMeetings.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-zinc-950/30 px-4 py-10 text-center flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-500">
                      <Inbox className="w-5 h-5" />
                    </div>
                    <p className="text-sm text-zinc-500">还没有会议，在上方创建一个吧</p>
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
                            onClick={() => {
                              navigator.clipboard.writeText(meeting.meetingId);
                              setCopiedId(meeting.meetingId);
                              toast.success("已复制会议 ID");
                              setTimeout(() => setCopiedId(null), 2000);
                            }}
                            className="p-2 text-zinc-500 hover:text-zinc-200 rounded-lg hover:bg-white/5 transition-colors active:scale-95"
                            title="复制会议 ID"
                          >
                            {copiedId === meeting.meetingId ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => onJoinMeeting(meeting.meetingId)}
                            className="p-2 text-zinc-500 hover:text-zinc-200 rounded-lg hover:bg-white/5 transition-colors active:scale-95"
                            title="加入会议"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setMeetingToDelete(meeting.meetingId)}
                            disabled={deactivatingMeetingId === meeting.meetingId}
                            className="p-2 text-zinc-500 hover:text-red-300 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-30 disabled:pointer-events-none active:scale-95"
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

                {adminToken && (
                  <div className="pt-4 flex justify-center">
                    <button
                      onClick={onClearAdminToken}
                      className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
                    >
                      退出管理模式
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {meetingToDelete && (
        <div className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] rounded-2xl"
            onClick={() => setMeetingToDelete(null)}
          />
          <div className="relative bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl max-w-[320px] w-full mx-4 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-white mb-2">删除会议</h3>
            <p className="text-sm text-zinc-400 mb-6">确定要删除此会议吗？相关的记录也将失效。</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setMeetingToDelete(null)}
                className="px-4 py-2 rounded-xl bg-white/5 text-zinc-300 hover:bg-white/10 transition-colors text-sm font-medium active:scale-95"
              >
                取消
              </button>
              <button
                onClick={() => {
                  onDeactivateMeeting(meetingToDelete);
                  setMeetingToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors text-sm font-medium flex items-center gap-2 active:scale-95"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
