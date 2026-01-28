import { useState, useEffect } from "react";
import { api } from "../lib/api-client";
import {
  getLastMeetingId,
  saveLastMeetingId,
  clearLastMeetingId,
} from "../lib/storage/meeting";
import type { User, MeetingSession } from "../types";

interface HomePageProps {
  user: User | null;
  onSaveUser: (name: string) => User;
  onJoinMeeting: (session: MeetingSession) => void;
}

export function HomePage({ user, onSaveUser, onJoinMeeting }: HomePageProps) {
  const [userName, setUserName] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMeetingId, setLastMeetingId] = useState<string | null>(null);

  useEffect(() => {
    setLastMeetingId(getLastMeetingId());
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

  const handleJoinMeeting = async (targetMeetingId?: string) => {
    const id = targetMeetingId || meetingId.trim();
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const res = await api.api.join.$post({
        json: {
          meetingId: id,
          userId: user.id,
          userName: user.name,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        if (targetMeetingId) {
          clearLastMeetingId();
          setLastMeetingId(null);
        }
        throw new Error((data as { error?: string }).error || "加入失败");
      }

      const data = await res.json();
      saveLastMeetingId(id);
      onJoinMeeting({
        meetingId: id,
        authToken: data.authToken,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "加入失败");
    } finally {
      setLoading(false);
    }
  };

  const handleClearLastMeeting = () => {
    clearLastMeetingId();
    setLastMeetingId(null);
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

        {/* Rejoin last meeting */}
        {lastMeetingId && (
          <div className="bg-slate-800 rounded-2xl p-6 border border-blue-500/50">
            <h2 className="text-lg font-semibold text-white mb-2">
              上次的会议
            </h2>
            <p className="text-slate-400 mb-4 font-mono text-sm break-all">
              {lastMeetingId}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleJoinMeeting(lastMeetingId)}
                disabled={loading}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {loading ? "加入中..." : "重新加入"}
              </button>
              <button
                onClick={handleClearLastMeeting}
                disabled={loading}
                className="px-4 py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-slate-300 rounded-lg transition-colors"
              >
                清除
              </button>
            </div>
          </div>
        )}

        {/* Join Meeting */}
        <div className="bg-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">加入会议</h2>
          <input
            type="text"
            value={meetingId}
            onChange={(e) => setMeetingId(e.target.value)}
            placeholder="输入 Meeting ID"
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 font-mono text-sm"
            disabled={loading}
          />
          <button
            onClick={() => handleJoinMeeting()}
            disabled={!meetingId.trim() || loading}
            className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {loading ? "加入中..." : "加入会议"}
          </button>
        </div>
      </div>
    </div>
  );
}
