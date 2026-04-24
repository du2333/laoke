import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AdminMeetingsPanel } from "@/features/meeting/client/components/AdminMeetingsPanel";
import { JoinMeetingPanel } from "@/features/meeting/client/components/JoinMeetingPanel";
import { Onboarding } from "@/features/meeting/client/components/Onboarding";
import { RecentMeetings } from "@/features/meeting/client/components/RecentMeetings";
import { UserProfile } from "@/features/meeting/client/components/UserProfile";
import { useAdminMeetings } from "@/features/meeting/client/hooks/useAdminMeetings";
import { useJoinMeeting } from "@/features/meeting/client/hooks/useJoinMeeting";
import { useMeetingHistory } from "@/features/meeting/client/hooks/useMeetingHistory";
import { saveCurrentMeetingSession } from "@/features/meeting/client/storage/current-meeting";
import type { MeetingSession } from "@/features/meeting/schema";
import { useUser } from "@/features/user/client/hooks/useUser";

export function HomePage() {
  const navigate = useNavigate();
  const { user, saveUser, updateUserName } = useUser();
  const [userName, setUserName] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const meetingHistory = useMeetingHistory();
  const adminMeetings = useAdminMeetings();
  const joinMeeting = useJoinMeeting({
    user,
    meetingId,
    adminToken: adminMeetings.adminToken,
    onJoinMeeting: handleJoinMeeting,
    onMeetingJoined: meetingHistory.saveJoinedMeeting,
    onTargetJoinFailed: meetingHistory.removeMeeting,
  });

  useEffect(() => {
    if (isEditingName && user) {
      setRenameValue(user.name);
    }
  }, [isEditingName, user]);

  function handleSaveUser() {
    const name = userName.trim();
    if (!name) return;
    saveUser(name);
  }

  function handleJoinMeeting(session: MeetingSession) {
    saveCurrentMeetingSession(session);
    void navigate({
      to: "/meeting/$meetingId",
      params: { meetingId: session.meetingId },
    });
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-zinc-950 overflow-hidden">
      <div className="bg-grain" />

      <div className="relative z-10 w-full max-w-4xl">
        {!user ? (
          <Onboarding userName={userName} setUserName={setUserName} onSaveUser={handleSaveUser} />
        ) : (
          <div
            key="main-content"
            className="grid gap-6 lg:grid-cols-[minmax(320px,380px)_1fr] animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-out"
          >
            <div className="space-y-6">
              <UserProfile
                user={user}
                isEditingName={isEditingName}
                renameValue={renameValue}
                setRenameValue={setRenameValue}
                setIsEditingName={setIsEditingName}
                onUpdateUserName={updateUserName}
              />

              <div className="space-y-6">
                <JoinMeetingPanel
                  meetingId={meetingId}
                  setMeetingId={setMeetingId}
                  loading={joinMeeting.joiningMeeting}
                  onJoinMeeting={joinMeeting.handleJoinMeeting}
                />
                <RecentMeetings
                  meetings={meetingHistory.meetingHistory}
                  onJoinMeeting={joinMeeting.handleJoinMeeting}
                  onRemoveMeeting={meetingHistory.removeMeeting}
                />
              </div>
            </div>

            <AdminMeetingsPanel
              adminToken={adminMeetings.adminToken}
              adminTokenInput={adminMeetings.adminTokenInput}
              setAdminTokenInput={adminMeetings.setAdminTokenInput}
              newMeetingTitle={adminMeetings.newMeetingTitle}
              setNewMeetingTitle={adminMeetings.setNewMeetingTitle}
              adminMeetings={adminMeetings.adminMeetings}
              adminMeetingsLoading={adminMeetings.adminMeetingsLoading}
              adminMeetingsError={adminMeetings.adminMeetingsError}
              adminMeetingsHasMore={adminMeetings.adminMeetingsHasMore}
              adminMeetingsLoadingMore={adminMeetings.adminMeetingsLoadingMore}
              creatingMeeting={adminMeetings.creatingMeeting}
              deactivatingMeetingId={adminMeetings.deactivatingMeetingId}
              onSaveAdminToken={adminMeetings.handleSaveAdminToken}
              onClearAdminToken={adminMeetings.handleClearAdminToken}
              onCreateMeeting={adminMeetings.handleCreateMeeting}
              onDeactivateMeeting={adminMeetings.handleDeactivateMeeting}
              onLoadMoreMeetings={adminMeetings.handleLoadMoreMeetings}
              onJoinMeeting={joinMeeting.handleJoinMeeting}
            />
          </div>
        )}
      </div>
    </div>
  );
}
