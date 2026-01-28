import { useState, useCallback } from "react";
import { useUser } from "./hooks/useUser";
import { HomePage } from "./pages/HomePage";
import { MeetingPage } from "./pages/MeetingPage";
import type { AppPage, MeetingSession } from "./types";

function App() {
  const { user, loading, saveUser } = useUser();
  const [page, setPage] = useState<AppPage>("home");
  const [meetingSession, setMeetingSession] = useState<MeetingSession | null>(
    null,
  );

  const handleJoinMeeting = useCallback((session: MeetingSession) => {
    setMeetingSession(session);
    setPage("meeting");
  }, []);

  const handleLeaveMeeting = useCallback(() => {
    setMeetingSession(null);
    setPage("home");
  }, []);

  // Show loading while checking localStorage
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">加载中...</div>
      </div>
    );
  }

  // Render current page
  if (page === "meeting" && meetingSession) {
    return (
      <MeetingPage session={meetingSession} onLeave={handleLeaveMeeting} />
    );
  }

  return (
    <HomePage
      user={user}
      onSaveUser={saveUser}
      onJoinMeeting={handleJoinMeeting}
    />
  );
}

export default App;
