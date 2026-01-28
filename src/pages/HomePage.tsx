import { useState, useEffect } from "react";
import { api } from "../lib/api-client";
import { getLastRoomId, clearLastRoomId } from "../lib/storage/room";
import type { User, RoomSession } from "../types";

interface HomePageProps {
  user: User | null;
  onSaveUser: (name: string) => User;
  onJoinRoom: (session: RoomSession) => void;
}

export function HomePage({ user, onSaveUser, onJoinRoom }: HomePageProps) {
  const [userName, setUserName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRoomId, setLastRoomId] = useState<string | null>(null);

  useEffect(() => {
    setLastRoomId(getLastRoomId());
  }, []);

  // If no user, show name input first
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">
            欢迎来到唠嗑
          </h1>
          <p className="text-slate-400 mb-6 text-center">
            输入你的昵称开始使用
          </p>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="你的昵称"
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            maxLength={20}
          />
          <button
            onClick={() => {
              if (userName.trim()) {
                onSaveUser(userName.trim());
              }
            }}
            disabled={!userName.trim()}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            继续
          </button>
        </div>
      </div>
    );
  }

  const handleCreateRoom = async () => {
    if (!roomName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await api.api.rooms.$post({
        json: {
          roomName: roomName.trim(),
          hostId: user.id,
          hostName: user.name,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error((data as { error?: string }).error || "创建房间失败");
      }

      const data = await res.json();
      onJoinRoom({
        room: data.room,
        authToken: data.authToken,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建房间失败");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (roomIdToJoin?: string) => {
    const targetRoomId = roomIdToJoin || roomCode.trim().toUpperCase();
    if (!targetRoomId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await api.api.rooms[":id"].join.$post({
        param: { id: targetRoomId },
        json: {
          userId: user.id,
          userName: user.name,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        // If room not found and we were trying to rejoin, clear the saved room
        if (roomIdToJoin) {
          clearLastRoomId();
          setLastRoomId(null);
        }
        throw new Error((data as { error?: string }).error || "房间不存在");
      }

      const data = await res.json();
      onJoinRoom({
        room: data.room,
        authToken: data.authToken,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "加入房间失败");
    } finally {
      setLoading(false);
    }
  };

  const handleClearLastRoom = () => {
    clearLastRoomId();
    setLastRoomId(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">唠嗑</h1>
          <p className="text-slate-400">
            你好, <span className="text-blue-400">{user.name}</span>
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Rejoin last room */}
        {lastRoomId && (
          <div className="bg-slate-800 rounded-2xl p-6 border border-blue-500/50">
            <h2 className="text-lg font-semibold text-white mb-2">上次的房间</h2>
            <p className="text-slate-400 mb-4 font-mono text-center text-xl tracking-widest">
              {lastRoomId}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleJoinRoom(lastRoomId)}
                disabled={loading}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {loading ? "加入中..." : "重新加入"}
              </button>
              <button
                onClick={handleClearLastRoom}
                disabled={loading}
                className="px-4 py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-slate-300 rounded-lg transition-colors"
              >
                清除
              </button>
            </div>
          </div>
        )}

        {/* Create Room */}
        <div className="bg-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">创建房间</h2>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="房间名称"
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            maxLength={50}
            disabled={loading}
          />
          <button
            onClick={handleCreateRoom}
            disabled={!roomName.trim() || loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {loading ? "创建中..." : "创建房间"}
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-slate-700" />
          <span className="text-slate-500 text-sm">或</span>
          <div className="flex-1 h-px bg-slate-700" />
        </div>

        {/* Join Room */}
        <div className="bg-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">加入房间</h2>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="输入6位房间号"
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 mb-4 uppercase tracking-widest text-center font-mono"
            maxLength={6}
            disabled={loading}
          />
          <button
            onClick={() => handleJoinRoom()}
            disabled={roomCode.length !== 6 || loading}
            className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {loading ? "加入中..." : "加入房间"}
          </button>
        </div>
      </div>
    </div>
  );
}
