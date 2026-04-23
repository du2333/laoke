import { Toaster } from "sonner";
import { useMeetingSession } from "@/hooks/useMeetingSession";
import { useUser } from "@/hooks/useUser";
import { HomePage } from "@/pages/HomePage";
import { MeetingPage } from "@/pages/MeetingPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient()

function App() {
  const { user, loading, saveUser, updateUserName } = useUser();
  const { page, meetingSession, joinMeeting, leaveMeeting } = useMeetingSession();

  // Show loading while checking localStorage
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">加载中...</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      {page === "meeting" && meetingSession ? (
        <MeetingPage session={meetingSession} onLeave={leaveMeeting} />
      ) : (
        <HomePage
          user={user}
          onSaveUser={saveUser}
          onUpdateUserName={updateUserName}
          onJoinMeeting={joinMeeting}
        />
      )}
      <Toaster position="top-center" theme="dark" richColors />
    </QueryClientProvider>
  );
}

export default App;
