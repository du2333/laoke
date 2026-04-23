import { useState, useEffect } from "react";
import { ArrowRight, History, Terminal, Hash, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import type { MeetingSession } from "@/lib/schema/meeting";
import type { User } from "@/lib/schema/user";
import { api } from "@/lib/api-client";
import {
  getLastMeetingId,
  saveLastMeetingId,
  clearLastMeetingId,
} from "@/lib/storage/meeting";
import { cn } from "@/lib/utils";

interface HomePageProps {
  user: User | null;
  onSaveUser: (name: string) => User;
  onJoinMeeting: (session: MeetingSession) => void;
}

export function HomePage({ user, onSaveUser, onJoinMeeting }: HomePageProps) {
  const [userName, setUserName] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastMeetingId, setLastMeetingId] = useState<string | null>(null);

  useEffect(() => {
    setLastMeetingId(getLastMeetingId());
  }, []);

  // --- LOGIN VIEW ---
  if (!user) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-6 bg-zinc-950">
        <div className="bg-grain" />
        <div className="relative z-10 w-full max-w-sm animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="mb-12 text-center pointer-events-none select-none">
            <h1 className="text-4xl font-bold tracking-tighter text-white mb-2 font-mono">
              唠嗑
            </h1>
            <p className="text-xs text-zinc-500 uppercase tracking-[0.2em]">
              随时随地，简单开黑
            </p>
          </div>

          <div className="group relative">
            <div className="absolute -inset-0.5 bg-linear-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && userName.trim()) {
                  onSaveUser(userName.trim());
                }
              }}
              placeholder="给自己起个名字"
              className="relative w-full bg-zinc-900/50 border border-white/10 rounded-xl px-5 py-4 text-center text-white placeholder-zinc-500 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all text-base"
              autoFocus
              maxLength={15}
            />
          </div>

          <div
            className={cn(
              "mt-8 flex justify-center transition-all duration-500",
              userName.trim()
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4 pointer-events-none",
            )}
          >
            <button
              onClick={() => userName.trim() && onSaveUser(userName.trim())}
              className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs uppercase tracking-widest"
            >
              <span>开始</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- DASHBOARD VIEW ---
  const handleJoinMeeting = async (targetId?: string) => {
    const id = targetId || meetingId.trim();
    if (!id) return;

    setLoading(true);
    const toastId = toast.loading("正在加入频道...");

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
        if (targetId) {
          clearLastMeetingId();
          setLastMeetingId(null);
        }
        throw new Error((data as { error?: string }).error || "加入失败");
      }

      const data = await res.json();
      saveLastMeetingId(id);
      toast.dismiss(toastId);
      toast.success("加入成功");
      onJoinMeeting({
        meetingId: id,
        authToken: data.authToken,
      });
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err instanceof Error ? err.message : "加入失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-zinc-950">
      <div className="bg-grain" />

      <div className="relative z-10 w-full max-w-sm space-y-8 animate-in fade-in zoom-in-95 duration-500">
        {/* Profile / Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-white/10 shadow-inner">
              <Terminal className="w-5 h-5 text-zinc-500" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[11px] font-medium text-zinc-500 tracking-wide">
                当前用户
              </p>
              <div className="text-base font-semibold text-white tracking-tight">
                {user.name}
              </div>
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="space-y-6">
          {/* Join Input ... existing code ... */}
          {/* (Note: I'll include the join input part too to ensure space-y matches) */}
          <div className="space-y-4">
            <label className="block text-xs font-medium text-zinc-400 ml-1">
              加入会议
            </label>
            <div className="relative group">
              <div className="absolute top-1/2 -translate-y-1/2 left-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors">
                <Hash className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={meetingId}
                onChange={(e) => setMeetingId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoinMeeting()}
                placeholder="在此输入或粘贴会议 ID"
                className="w-full bg-zinc-900/80 border border-white/10 rounded-xl py-4 pl-11 pr-12 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all text-base"
                disabled={loading}
              />
              <div className="absolute top-1/2 -translate-y-1/2 right-2">
                <button
                  onClick={() => handleJoinMeeting()}
                  disabled={!meetingId.trim() || loading}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white disabled:opacity-0 disabled:pointer-events-none transition-all duration-300"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Recent Meetings */}
          {lastMeetingId && (
            <div className="pt-2 animate-in fade-in slide-in-from-top-2">
              <label className="block text-xs font-medium text-zinc-400 ml-1 mb-3">
                近期会议
              </label>
              <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-3 flex items-center gap-3 group hover:border-white/20 transition-all">
                <div
                  className="flex items-center gap-4 flex-1 cursor-pointer overflow-hidden"
                  onClick={() => handleJoinMeeting(lastMeetingId)}
                >
                  <div className="shrink-0 w-9 h-9 rounded-lg bg-zinc-800/50 flex items-center justify-center text-zinc-500 group-hover:text-blue-400 transition-colors border border-white/5">
                    <History className="w-4 h-4" />
                  </div>
                  <div className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors truncate">
                    {lastMeetingId}
                  </div>
                </div>
                <button
                  onClick={clearLastMeetingId}
                  className="shrink-0 p-2 text-zinc-600 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5"
                  title="清除记录"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
