import { Shield, X } from "lucide-react";
import { useState } from "react";

import { useAdminMeetings } from "@/features/meeting/client/hooks/useAdminMeetings";
import type { MeetingId } from "@/features/meeting/schema";

import { AdminLoginForm } from "./AdminLoginForm";
import { AdminMeetingCreator } from "./AdminMeetingCreator";
import { AdminMeetingList } from "./AdminMeetingList";
import { DeleteMeetingDialog } from "./DeleteMeetingDialog";

type AdminMeetingsPanelProps = {
  onJoinMeeting: (meetingId?: string) => void;
  onClose: () => void;
};

export function AdminMeetingsPanel({ onJoinMeeting, onClose }: AdminMeetingsPanelProps) {
  const adminMeetings = useAdminMeetings();
  const [meetingToDelete, setMeetingToDelete] = useState<MeetingId | null>(null);

  function handleConfirmDeleteMeeting() {
    if (!meetingToDelete) return;

    adminMeetings.handleDeactivateMeeting(meetingToDelete);
    setMeetingToDelete(null);
  }

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
          {!adminMeetings.adminToken ? (
            <AdminLoginForm
              adminTokenInput={adminMeetings.adminTokenInput}
              setAdminTokenInput={adminMeetings.setAdminTokenInput}
              onSaveAdminToken={adminMeetings.handleSaveAdminToken}
            />
          ) : (
            <div className="space-y-5 pb-4">
              <AdminMeetingCreator
                newMeetingTitle={adminMeetings.newMeetingTitle}
                setNewMeetingTitle={adminMeetings.setNewMeetingTitle}
                creatingMeeting={adminMeetings.creatingMeeting}
                onCreateMeeting={adminMeetings.handleCreateMeeting}
              />

              <AdminMeetingList
                meetings={adminMeetings.adminMeetings}
                loading={adminMeetings.adminMeetingsLoading}
                error={adminMeetings.adminMeetingsError}
                hasMore={adminMeetings.adminMeetingsHasMore}
                loadingMore={adminMeetings.adminMeetingsLoadingMore}
                deactivatingMeetingId={adminMeetings.deactivatingMeetingId}
                onLoadMoreMeetings={adminMeetings.handleLoadMoreMeetings}
                onJoinMeeting={onJoinMeeting}
                onRequestDeleteMeeting={setMeetingToDelete}
              />

              <div className="pt-4 flex justify-center">
                <button
                  onClick={adminMeetings.handleClearAdminToken}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
                >
                  退出管理模式
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {meetingToDelete ? (
        <DeleteMeetingDialog
          onCancel={() => setMeetingToDelete(null)}
          onConfirm={handleConfirmDeleteMeeting}
        />
      ) : null}
    </>
  );
}
