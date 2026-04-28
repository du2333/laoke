import { Inbox, Loader2 } from "lucide-react";

import type { ManagedMeeting, MeetingId } from "@/features/meeting/schema";

import { AdminMeetingRow } from "./AdminMeetingRow";

type AdminMeetingListProps = {
  meetings: Array<ManagedMeeting>;
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadingMore: boolean;
  deactivatingMeetingId?: MeetingId;
  onLoadMoreMeetings: () => void;
  onJoinMeeting: (meetingId?: string) => void;
  onRequestDeleteMeeting: (meetingId: MeetingId) => void;
};

export function AdminMeetingList({
  meetings,
  loading,
  error,
  hasMore,
  loadingMore,
  deactivatingMeetingId,
  onLoadMoreMeetings,
  onJoinMeeting,
  onRequestDeleteMeeting,
}: AdminMeetingListProps) {
  return (
    <>
      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error.message}
        </div>
      ) : null}

      <div className="grid gap-3">
        <AdminMeetingListContent
          meetings={meetings}
          loading={loading}
          deactivatingMeetingId={deactivatingMeetingId}
          onJoinMeeting={onJoinMeeting}
          onRequestDeleteMeeting={onRequestDeleteMeeting}
        />

        {hasMore ? (
          <LoadMoreMeetingsButton loading={loadingMore} onLoadMoreMeetings={onLoadMoreMeetings} />
        ) : null}
      </div>
    </>
  );
}

type AdminMeetingListContentProps = {
  meetings: Array<ManagedMeeting>;
  loading: boolean;
  deactivatingMeetingId?: MeetingId;
  onJoinMeeting: (meetingId?: string) => void;
  onRequestDeleteMeeting: (meetingId: MeetingId) => void;
};

function AdminMeetingListContent({
  meetings,
  loading,
  deactivatingMeetingId,
  onJoinMeeting,
  onRequestDeleteMeeting,
}: AdminMeetingListContentProps) {
  if (loading && meetings.length === 0) {
    return <AdminMeetingLoadingState />;
  }

  if (meetings.length === 0) {
    return <AdminMeetingEmptyState />;
  }

  return meetings.map((meeting) => (
    <AdminMeetingRow
      key={meeting.meetingId}
      meeting={meeting}
      deactivatingMeetingId={deactivatingMeetingId}
      onJoinMeeting={onJoinMeeting}
      onRequestDeleteMeeting={onRequestDeleteMeeting}
    />
  ));
}

function AdminMeetingLoadingState() {
  return (
    <div className="flex items-center justify-center py-12 text-zinc-500">
      <Loader2 className="w-5 h-5 animate-spin" />
    </div>
  );
}

function AdminMeetingEmptyState() {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/30 px-4 py-10 text-center flex flex-col items-center justify-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-500">
        <Inbox className="w-5 h-5" />
      </div>
      <p className="text-sm text-zinc-500">还没有会议，在上方创建一个吧</p>
    </div>
  );
}

type LoadMoreMeetingsButtonProps = {
  loading: boolean;
  onLoadMoreMeetings: () => void;
};

function LoadMoreMeetingsButton({ loading, onLoadMoreMeetings }: LoadMoreMeetingsButtonProps) {
  return (
    <button
      onClick={onLoadMoreMeetings}
      disabled={loading}
      className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-zinc-950/30 px-4 py-3 text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:border-white/20 transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
      加载更多
    </button>
  );
}
