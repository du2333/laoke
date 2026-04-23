import { useState, useCallback } from "react";
import { Toaster } from "sonner";
import type { AppPage } from "./lib/schema/app";
import type { MeetingSession } from "./lib/schema/meeting";
import { useUser } from "./hooks/useUser";
import { HomePage } from "./pages/HomePage";
import { MeetingPage } from "./pages/MeetingPage";

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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">加载中...</div>
      </div>
    );
  }

  return (
    <>
      {page === "meeting" && meetingSession ? (
        <MeetingPage session={meetingSession} onLeave={handleLeaveMeeting} />
      ) : (
        <HomePage
          user={user}
          onSaveUser={saveUser}
          onJoinMeeting={handleJoinMeeting}
        />
      )}
      <Toaster position="top-center" theme="dark" richColors />
    </>
  );
}

export default App;
