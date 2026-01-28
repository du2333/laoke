import { useState, useCallback } from "react";
import { useUser } from "./hooks/useUser";
import { HomePage } from "./pages/HomePage";
import { RoomPage } from "./pages/RoomPage";
import { saveLastRoomId } from "./lib/storage/room";
import type { AppPage, RoomSession } from "./types";

function App() {
  const { user, loading, saveUser } = useUser();
  const [page, setPage] = useState<AppPage>("home");
  const [roomSession, setRoomSession] = useState<RoomSession | null>(null);

  const handleJoinRoom = useCallback((session: RoomSession) => {
    saveLastRoomId(session.room.id);
    setRoomSession(session);
    setPage("room");
  }, []);

  const handleLeaveRoom = useCallback(() => {
    setRoomSession(null);
    setPage("home");
  }, []);

  // Show loading while checking localStorage
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Render current page
  if (page === "room" && roomSession) {
    return <RoomPage session={roomSession} onLeave={handleLeaveRoom} />;
  }

  return (
    <HomePage user={user} onSaveUser={saveUser} onJoinRoom={handleJoinRoom} />
  );
}

export default App;
